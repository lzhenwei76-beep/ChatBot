# 🤖 AI Chat • Intelligenter Assistent

Ein moderner, KI-gestützter Chat-Assistent mit Streaming-Unterstützung, Code-Highlighting und Freemium-Token-System.

![Version](https://img.shields.io/badge/version-2.1.0-blue)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## ✨ Features

### 🎨 Benutzeroberfläche
- Dark/Light Mode - Umschaltbar mit Smooth-Animation
- Responsive Design - Optimiert für Desktop, Tablet & Mobile
- Modernes UI - Glassmorphism, Gradienten & Animationen
- Sidebar - Chat-Verlauf, Statistiken & Einstellungen

### 💬 Chat-Funktionen
- Streaming-Antworten - Echtzeit-Textgenerierung (optional)
- Code-Highlighting - Syntax-Hervorhebung für 20+ Sprachen
- Markdown-Unterstützung - Tabellen, Zitate, Listen & mehr
- Token-Zähler - Live-Tracking des Token-Verbrauchs
- Chat-Verlauf - Alle Chats werden lokal gespeichert
- Export/Import - Chats als JSON sichern & wiederherstellen

### 🔧 Technische Features
- Groq API Integration - Schnelle LLM-Inferenz
- Rate Limiting - Schutz vor Überlastung
- Model-Caching - 30 Sekunden Cache für bessere Performance
- Health Check - Server-Status live überwachbar

### 🪙 Freemium-System
- 1.000.000 Tokens kostenlos
- Token-Tracking mit Fortschrittsbalken
- Warnungen bei 75% und 90% Verbrauch

---

## 🚀 Schnellstart

### Voraussetzungen
- Node.js >= 18.0.0 (https://nodejs.org/)
- Groq API Key (https://console.groq.com)

### Installation

# 1. Repository klonen
git clone https://github.com/DEIN_USERNAME/ai-chat.git
cd ai-chat

# 2. Abhängigkeiten installieren
npm install

# 3. .env Datei erstellen
cp .env.example .env
# Jetzt GROQ_API_KEY in die .env Datei eintragen!

# 4. Server starten
npm run dev

### Verwendung
1. Server läuft auf http://localhost:3000
2. Öffne index.html im Browser (Doppelklick)
3. Wähle ein Modell aus der Dropdown-Liste
4. Starte eine Unterhaltung!

---

## 📁 Projektstruktur

ai-chat/
├── index.html          # Frontend-Anwendung
├── server.js           # Express-Backend
├── package.json        # Node.js Abhängigkeiten
├── .env                # Umgebungsvariablen (nicht im Git!)
├── .env.example        # Vorlage für .env
└── README.md           # Diese Datei

---

## ⚙️ Konfiguration

### .env Datei

# Groq API Key (erforderlich)
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server Port (optional, default: 3000)
PORT=3000

# Erlaubte Origins für CORS (kommagetrennt)
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,null

# Admin Secret für Cache-Admin-Funktionen
ADMIN_SECRET=mein-geheimes-passwort-123

# Umgebung
NODE_ENV=development

### Verfügbare Modelle

| Modell | Kontext | Beschreibung |
|--------|---------|--------------|
| llama-3.3-70b-versatile | 128K | Vielseitiges 70B Modell |
| llama-3.1-8b-instant | 128K | Schnelles 8B Modell |
| mixtral-8x7b-32768 | 32K | Mixtral MoE Modell |
| gemma2-9b-it | 8K | Google's Gemma 2 |

---

## 📡 API Endpoints

| Methode | Endpoint | Beschreibung |
|---------|----------|--------------|
| GET | / | Server-Informationen |
| GET | /health | Health Check & Status |
| GET | /models | Alle verfügbaren Modelle |
| GET | /models/:id | Details zu einem Modell |
| POST | /chat | Chat-Anfrage (normal) |
| POST | /chat/stream | Chat-Anfrage (streaming) |
| POST | /chat/title | Chat-Titel generieren |
| POST | /tokens/estimate | Token-Schätzung |
| POST | /cache/clear | Cache leeren (Admin) |

### Beispiel: Chat-Anfrage

const response = await fetch('http://localhost:3000/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "Erkläre mir Quantenphysik",
    model: "llama-3.3-70b-versatile",
    history: []
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);

---

## ⌨️ Tastenkürzel

| Tastenkombination | Aktion |
|-------------------|--------|
| Enter | Nachricht senden |
| Shift + Enter | Neue Zeile |
| Ctrl + K | Neuer Chat |
| Ctrl + F | Chats durchsuchen |
| Ctrl + E | Chat exportieren |
| Ctrl + Shift + L | Chat leeren |
| Ctrl + / | Tastenkürzel anzeigen |
| ESC | Menüs schließen |

---

## 🔧 Verfügbare Scripts

# Server starten (Produktion)
npm start

# Server starten (Entwicklung mit Auto-Reload)
npm run dev

# Server mit Production-Umgebung starten
npm run prod

---

## 🐛 Fehlerbehebung

| Problem | Lösung |
|---------|--------|
| "npm wird nicht erkannt" | Node.js installieren & PC neu starten |
| "Error: Cannot find module" | npm install ausführen |
| "GROQ_API_KEY fehlt" | .env Datei mit API-Key erstellen |
| Server startet nicht | Port 3000 prüfen oder PORT in .env ändern |
| "Failed to fetch" | Server läuft nicht - npm run dev ausführen |
| Chat antwortet nicht | Groq API-Key gültig? |

---

## 🏗️ Technologie-Stack

### Frontend
- Vanilla JavaScript (ES6+)
- CSS3 (Custom Properties, Grid, Flexbox)
- Highlight.js

### Backend
- Node.js + Express
- Groq SDK
- Helmet + Rate Limit + Compression

---

## 📄 Lizenz

MIT License - Siehe LICENSE für Details.

---

## 👤 Autor

Dein Name
- GitHub: @DEIN_USERNAME
- Twitter: @DEIN_TWITTER

---

## ⭐ Danksagungen

- Groq - Für die schnelle LLM-API
- Highlight.js - Syntax-Highlighting

---

⭐ Wenn dir dieses Projekt gefällt, gib ihm einen Stern!
