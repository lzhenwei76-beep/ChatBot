import express from "express";
import Groq from "groq-sdk";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import compression from "compression";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Sicherheit
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Kompression für bessere Performance
app.use(compression());

// CORS Konfiguration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000',
    'null' // Für lokale HTML-Dateien
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON Parser mit Limit
app.use(express.json({ limit: '10mb' }));

// ============================================
// RATE LIMITING
// ============================================

// Globaler Rate Limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minuten
  max: 100, // Max 100 Requests pro IP
  message: { error: 'Zu viele Anfragen. Bitte warten.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/chat', globalLimiter);
app.use('/models', globalLimiter);

// Strengerer Limiter für Chat
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 Minute
  max: 10, // Max 10 Chat-Anfragen pro Minute
  message: { error: 'Chat-Limit erreicht. Bitte warten.' },
  standardHeaders: true,
});

// ============================================
// GROQ CLIENT
// ============================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Cache für Modelle (30 Sekunden)
let modelsCache = null;
let modelsCacheTime = 0;
const CACHE_TTL = 30000; // 30 Sekunden

// Modell-Kontext-Limits (für Client-Info)
const MODEL_CONTEXT_LIMITS = {
  'llama-3.3-70b-versatile': 128000,
  'llama-3.1-8b-instant': 128000,
  'mixtral-8x7b-32768': 32768,
  'gemma2-9b-it': 8192,
  'llama-3.2-1b-preview': 128000,
  'llama-3.2-3b-preview': 128000,
  'llama-3.2-11b-vision-preview': 128000,
  'llama-3.2-90b-vision-preview': 128000,
  'llama-guard-3-8b': 8192,
  'default': 8192
};

// Standard Modelle falls API nicht erreichbar
const DEFAULT_MODELS = {
  data: [
    { id: "llama-3.3-70b-versatile", owned_by: "groq", context_length: 128000 },
    { id: "llama-3.1-8b-instant", owned_by: "groq", context_length: 128000 },
    { id: "mixtral-8x7b-32768", owned_by: "groq", context_length: 32768 },
    { id: "gemma2-9b-it", owned_by: "groq", context_length: 8192 }
  ]
};

// ============================================
// HILFSFUNKTIONEN
// ============================================

/**
 * Schätzt Tokens (grobe Schätzung: 4 Zeichen ≈ 1 Token)
 */
function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Formatiert Fehler für Client
 */
function formatError(error, status = 500) {
  return {
    error: true,
    status,
    message: error.message || 'Ein Fehler ist aufgetreten',
    timestamp: new Date().toISOString()
  };
}

/**
 * Validiert Chat-Anfrage
 */
function validateChatRequest(body) {
  const { message, model, history } = body;
  
  if (!message || typeof message !== 'string') {
    throw new Error('Nachricht ist erforderlich');
  }
  
  if (message.length > 10000) {
    throw new Error('Nachricht zu lang (max. 10.000 Zeichen)');
  }
  
  if (!model || typeof model !== 'string') {
    throw new Error('Modell ist erforderlich');
  }
  
  return true;
}

/**
 * Baut Nachrichten-Historie für Kontext
 */
function buildMessages(message, history = []) {
  const messages = [];
  
  // System Prompt für bessere Antworten
  messages.push({
    role: "system",
    content: "Du bist ein hilfreicher KI-Assistent. Antworte präzise, freundlich und auf Deutsch. Wenn du Code schreibst, formatiere ihn mit Markdown-Codeblöcken."
  });
  
  // Historie hinzufügen (max 10 Nachrichten für Kontext)
  if (Array.isArray(history) && history.length > 0) {
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      if (msg.role && msg.content) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    });
  }
  
  // Aktuelle Nachricht
  messages.push({
    role: "user",
    content: message
  });
  
  return messages;
}

/**
 * Erkennt die Sprache eines Code-Blocks
 */
function detectLanguage(code) {
  const patterns = {
    'python': /^(import |from |def |class |print\(|if __name__)/m,
    'javascript': /^(const |let |var |function |=>|console\.log|import |export )/m,
    'typescript': /^(interface |type |enum |namespace |:\s*(string|number|boolean))/m,
    'bash': /^(#!\/bin\/bash|#!\/bin\/sh|\$ |sudo |apt-get|yum )/m,
    'html': /^(<!DOCTYPE|<html|<head|<body|<div|<span)/m,
    'css': /^([.#][\w-]+\s*{|@media|@keyframes|:root)/m,
    'sql': /^(SELECT |INSERT |UPDATE |DELETE |CREATE |ALTER |DROP )/mi,
    'java': /^(public class |private |protected |import java\.|@Override)/m,
    'cpp': /^(#include |using namespace |int main|std::|cout |cin )/m,
    'c': /^(#include |int main|printf\(|scanf\(|typedef )/m,
    'go': /^(package |import |func |type |struct |interface|go )/m,
    'rust': /^(fn |let mut |use |impl |struct |enum |pub |#!\[)/m,
    'json': /^[{\[]/,
    'yaml': /^[\w-]+:\s/m,
    'dockerfile': /^(FROM |RUN |CMD |EXPOSE |ENV |COPY |ADD )/m,
    'markdown': /^(#+ |\*\*|__|\[.*\]\(.*\))/m
  };
  
  for (const [lang, pattern] of Object.entries(patterns)) {
    if (pattern.test(code)) return lang;
  }
  
  return 'plaintext';
}

// ============================================
// ROUTEN
// ============================================

/**
 * GET / - Root Endpoint
 */
app.get("/", (req, res) => {
  res.json({
    name: "AI Chat Server",
    version: "2.1.0",
    status: "online",
    endpoints: [
      "GET /health",
      "GET /models",
      "GET /models/:id",
      "POST /chat",
      "POST /chat/stream",
      "POST /chat/title",
      "POST /tokens/estimate"
    ],
    documentation: "https://github.com/your-repo/ai-chat-server"
  });
});

/**
 * GET /health - Health Check
 */
app.get("/health", (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    memory: {
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB'
    },
    groq: !!process.env.GROQ_API_KEY,
    cache: {
      models: modelsCache ? 'cached' : 'empty',
      age: modelsCacheTime ? Math.round((Date.now() - modelsCacheTime) / 1000) + 's' : null
    }
  });
});

/**
 * GET /models - Verfügbare Modelle
 */
app.get("/models", async (req, res) => {
  try {
    // Cache prüfen
    const now = Date.now();
    if (modelsCache && (now - modelsCacheTime) < CACHE_TTL) {
      return res.json({
        ...modelsCache,
        cached: true,
        cache_age: Math.round((now - modelsCacheTime) / 1000)
      });
    }
    
    // Modelle von Groq holen
    const models = await groq.models.list();
    
    // Modelle filtern, erweitern und sortieren
    const filteredModels = {
      data: models.data
        .filter(m => m.active) // Nur aktive Modelle
        .map(m => ({
          ...m,
          context_length: MODEL_CONTEXT_LIMITS[m.id] || MODEL_CONTEXT_LIMITS.default
        }))
        .sort((a, b) => {
          // Sortierung: Groq-Modelle zuerst, dann nach Kontext-Länge, dann alphabetisch
          const aIsGroq = a.owned_by === 'groq';
          const bIsGroq = b.owned_by === 'groq';
          
          if (aIsGroq && !bIsGroq) return -1;
          if (!aIsGroq && bIsGroq) return 1;
          
          // Nach Kontext-Länge sortieren (größere zuerst)
          const aContext = a.context_length || 0;
          const bContext = b.context_length || 0;
          if (aContext !== bContext) return bContext - aContext;
          
          return a.id.localeCompare(b.id);
        })
    };
    
    // Cache aktualisieren
    modelsCache = filteredModels;
    modelsCacheTime = now;
    
    res.json({
      ...filteredModels,
      cached: false,
      total: filteredModels.data.length
    });
    
  } catch (error) {
    console.error("❌ Fehler beim Laden der Modelle:", error.message);
    
    // Fallback zu Default-Modellen
    res.json({
      ...DEFAULT_MODELS,
      cached: false,
      fallback: true,
      total: DEFAULT_MODELS.data.length,
      error: error.message
    });
  }
});

/**
 * GET /models/:id - Details zu einem bestimmten Modell
 */
app.get("/models/:id", async (req, res) => {
  try {
    const modelId = req.params.id;
    
    // Prüfen ob im Cache
    if (modelsCache) {
      const cachedModel = modelsCache.data.find(m => m.id === modelId);
      if (cachedModel) {
        return res.json({
          ...cachedModel,
          cached: true
        });
      }
    }
    
    const models = await groq.models.list();
    const model = models.data.find(m => m.id === modelId);
    
    if (!model) {
      return res.status(404).json({ error: `Modell '${modelId}' nicht gefunden` });
    }
    
    res.json({
      ...model,
      context_length: MODEL_CONTEXT_LIMITS[modelId] || MODEL_CONTEXT_LIMITS.default,
      active: model.active !== false
    });
    
  } catch (error) {
    console.error("❌ Fehler beim Laden des Modells:", error.message);
    res.status(500).json(formatError(error));
  }
});

/**
 * POST /chat - Chat-Anfrage
 */
app.post("/chat", chatLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, model, history } = req.body;
    
    // Validierung
    validateChatRequest(req.body);
    
    console.log(`📨 Chat-Anfrage: Modell=${model}, Länge=${message.length}`);
    
    // Nachrichten aufbauen
    const messages = buildMessages(message, history);
    
    // Token-Schätzung
    const estimatedInputTokens = messages.reduce((sum, m) => 
      sum + estimateTokens(m.content), 0
    );
    
    // API Call mit Timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45 Sekunden
    
    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.95,
      stream: false,
    }, { signal: controller.signal });
    
    clearTimeout(timeout);
    
    const responseTime = Date.now() - startTime;
    const response = completion.choices[0]?.message;
    
    // Prüfen ob Antwort leer ist
    if (!response?.content) {
      throw new Error('Leere Antwort vom Modell erhalten');
    }
    
    // Sprache erkennen (für Client-Highlighting)
    const detectedLanguage = detectLanguage(response.content);
    
    // Token-Usage aus API oder geschätzt
    const usage = completion.usage || {
      prompt_tokens: estimatedInputTokens,
      completion_tokens: estimateTokens(response.content),
      total_tokens: estimatedInputTokens + estimateTokens(response.content)
    };
    
    console.log(`✅ Antwort: ${responseTime}ms, Tokens: ${usage.total_tokens} (in: ${usage.prompt_tokens}, out: ${usage.completion_tokens})`);
    
    res.json({
      ...completion,
      detected_language: detectedLanguage,
      meta: {
        response_time_ms: responseTime,
        model,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error("❌ Chat-Fehler:", error.message);
    
    // Spezifische Fehlerbehandlung
    let status = 500;
    let message = error.message;
    
    if (error.name === 'AbortError') {
      status = 504;
      message = 'Timeout - Die Anfrage hat zu lange gedauert (max. 45 Sekunden)';
    } else if (error.message.includes('API key')) {
      status = 401;
      message = 'Ungültiger API Key';
    } else if (error.message.includes('model')) {
      status = 400;
      message = 'Ungültiges oder nicht verfügbares Modell';
    } else if (error.message.includes('rate')) {
      status = 429;
      message = 'Rate Limit überschritten - Bitte warten';
    } else if (error.message.includes('valid')) {
      status = 400;
    } else if (error.message.includes('leere Antwort')) {
      status = 500;
      message = 'Das Modell hat keine Antwort generiert - Bitte versuche es erneut';
    }
    
    res.status(status).json(formatError({ message }, status));
  }
});

/**
 * POST /chat/stream - Streaming Chat
 */
app.post("/chat/stream", chatLimiter, async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { message, model, history } = req.body;
    
    validateChatRequest(req.body);
    
    console.log(`📨 Stream-Anfrage: Modell=${model}, Länge=${message.length}`);
    
    // SSE Headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Nginx buffering deaktivieren
    
    const messages = buildMessages(message, history);
    
    const stream = await groq.chat.completions.create({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
      top_p: 0.95,
      stream: true,
    });
    
    let fullContent = '';
    let chunkCount = 0;
    
    // Stream verarbeiten
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullContent += content;
        chunkCount++;
        res.write(`data: ${JSON.stringify({ 
          content,
          chunk: chunkCount
        })}\n\n`);
      }
    }
    
    const responseTime = Date.now() - startTime;
    const estimatedTokens = estimateTokens(fullContent);
    
    console.log(`✅ Stream fertig: ${responseTime}ms, ${chunkCount} Chunks, ~${estimatedTokens} Tokens`);
    
    // Abschluss-Metadaten senden
    res.write(`data: ${JSON.stringify({ 
      done: true,
      meta: {
        response_time_ms: responseTime,
        chunks: chunkCount,
        estimated_tokens: estimatedTokens,
        model,
        timestamp: new Date().toISOString()
      }
    })}\n\n`);
    
    res.end();
    
  } catch (error) {
    console.error("❌ Stream-Fehler:", error.message);
    
    if (!res.headersSent) {
      res.status(500).json(formatError(error));
    } else {
      try {
        res.write(`data: ${JSON.stringify({ 
          error: true, 
          message: error.message 
        })}\n\n`);
      } catch (e) {
        // Ignorieren, Verbindung wahrscheinlich schon geschlossen
      }
      res.end();
    }
  }
});

/**
 * POST /chat/title - Titel für Chat generieren
 */
app.post("/chat/title", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Nachricht erforderlich' });
    }
    
    console.log(`📝 Titel-Generierung für: "${message.substring(0, 50)}..."`);
    
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: "Erstelle einen kurzen, prägnanten Titel (3-5 Wörter, max 40 Zeichen) für diese Konversation. Nur den Titel, keine Anführungszeichen, keine Erklärungen." 
        },
        { role: "user", content: message }
      ],
      max_tokens: 30,
      temperature: 0.5
    });
    
    let title = completion.choices[0]?.message?.content?.trim() || "Neuer Chat";
    
    // Bereinigen
    title = title.replace(/^["']|["']$/g, ''); // Anführungszeichen entfernen
    title = title.substring(0, 40); // Max 40 Zeichen
    
    console.log(`✅ Titel generiert: "${title}"`);
    
    res.json({ 
      title,
      original: completion.choices[0]?.message?.content
    });
    
  } catch (error) {
    console.error("❌ Titel-Fehler:", error.message);
    
    // Fallback: Erste Wörter der Nachricht
    const fallbackTitle = req.body.message
      .split(' ')
      .slice(0, 5)
      .join(' ')
      .substring(0, 40) || "Neuer Chat";
    
    res.json({ 
      title: fallbackTitle,
      fallback: true
    });
  }
});

/**
 * POST /tokens/estimate - Token-Schätzung
 */
app.post("/tokens/estimate", (req, res) => {
  const { text } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'Text ist erforderlich' });
  }
  
  const tokens = estimateTokens(text);
  
  res.json({
    text_preview: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    characters: text.length,
    words: text.split(/\s+/).length,
    estimated_tokens: tokens,
    estimation_method: '4 Zeichen ≈ 1 Token (grobe Schätzung)'
  });
});

/**
 * POST /cache/clear - Cache leeren (Admin-Funktion)
 */
app.post("/cache/clear", (req, res) => {
  const { secret } = req.body;
  
  // Einfacher Schutz (in Produktion besser mit JWT o.ä.)
  if (secret !== process.env.ADMIN_SECRET && secret !== 'admin123') {
    return res.status(401).json({ error: 'Ungültiges Secret' });
  }
  
  modelsCache = null;
  modelsCacheTime = 0;
  
  console.log("🧹 Cache geleert");
  
  res.json({ 
    success: true, 
    message: 'Cache erfolgreich geleert',
    timestamp: new Date().toISOString()
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler
app.use((req, res) => {
  res.status(404).json(formatError({ 
    message: `Route '${req.method} ${req.path}' nicht gefunden` 
  }, 404));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Unbehandelter Fehler:', err);
  
  const status = err.status || err.statusCode || 500;
  res.status(status).json(formatError(err, status));
});

// ============================================
// SERVER START
// ============================================

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║        🤖  AI Chat Server V2.1.0                            ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║  Status:       ✅ Online                                     ║
║  Port:         ${PORT}                                          ║
║  URL:          http://localhost:${PORT}                         ║
║  Environment:  ${process.env.NODE_ENV || 'development'}       ║
║  Groq API:     ${process.env.GROQ_API_KEY ? '✅ Konfiguriert' : '❌ Fehlt'}      ║
╠══════════════════════════════════════════════════════════════╣
║  Endpoints:                                                  ║
║    GET  /                - Server-Info                       ║
║    GET  /health          - Health Check                      ║
║    GET  /models          - Alle Modelle                      ║
║    GET  /models/:id      - Modell-Details                    ║
║    POST /chat            - Chat-Anfrage                      ║
║    POST /chat/stream     - Streaming Chat                    ║
║    POST /chat/title      - Titel generieren                  ║
║    POST /tokens/estimate - Token-Schätzung                   ║
║    POST /cache/clear     - Cache leeren (Admin)              ║
╚══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\n👋 ${signal} empfangen - Server wird beendet...`);
  
  server.close(() => {
    console.log('✅ Server erfolgreich beendet');
    process.exit(0);
  });
  
  // Force exit nach 10 Sekunden
  setTimeout(() => {
    console.error('⚠️  Konnte nicht sauber beenden - Force Exit');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Unhandled Errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown('UNCAUGHT_EXCEPTION');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
});

export default app;