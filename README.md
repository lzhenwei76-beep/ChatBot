# 🤖 AI Chat Server • Groq API

Ein moderner KI-Chat Server mit Groq API, Streaming, Rate Limiting, Model-Cache und Token-System.

---

## ⚙️ Voraussetzungen

### 📦 Installieren

👉 Node.js (LTS)
https://nodejs.org

👉 Git (optional)
https://git-scm.com/downloads

---

## 🚀 Projekt starten

### 1️⃣ Repository klonen
```bash
git clone https://github.com/DEIN_USERNAME/ai-chat-server.git](https://github.com/lzhenwei76-beep/ChatBot.git
cd ChatBot
```

---

### 2️⃣ Dependencies installieren
```bash
npm install
```

---

### 3️⃣ .env Datei erstellen

Erstelle eine Datei `.env` im Root-Ordner:

```env
# Groq API Key (erforderlich)
GROQ_API_KEY=DEIN_API_KEY_HIER

# Server Port
PORT=3000

# CORS Origins
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,http://127.0.0.1:3000

# Admin Secret
ADMIN_SECRET=DEIN_SECRET

# Environment
NODE_ENV=development
```

---

## ▶️ Server starten

### 🔥 Development Mode (Auto Reload)
```bash
npm run dev
```

### 🚀 Production Mode
```bash
npm start
```

### 🧪 Direkt starten
```bash
node server.js
```

---

## 🌐 Server öffnen

Wenn der Server läuft:

```text
http://localhost:3000
```

---

## 📡 API Übersicht

| Methode | Endpoint | Beschreibung |
|--------|----------|--------------|
| GET | / | Server Info |
| GET | /health | Status + Memory |
| GET | /models | Groq Modelle |
| GET | /models/:id | Modell Details |
| POST | /chat | Chat Anfrage |
| POST | /chat/stream | Streaming Chat |
| POST | /chat/title | Chat Titel |
| POST | /tokens/estimate | Token Schätzung |

---

## 💬 Chat Beispiel

```js
const res = await fetch("http://localhost:3000/chat", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    message: "Erkläre Quantenphysik",
    model: "llama-3.3-70b-versatile",
    history: []
  })
});

const data = await res.json();
console.log(data.choices[0].message.content);
```

---

## 🧠 Features

### ⚡ Performance
- Groq API Integration (ultra schnell)
- Response Streaming
- Model Cache (30s)

### 🛡️ Sicherheit
- Helmet Security Headers
- Rate Limiting (Chat + Global)
- CORS Protection

### 📊 Extras
- Token Schätzung
- Chat Titel Generator
- Health Check
- Memory Usage Monitoring

---

## 🧪 NPM Scripts

```bash
npm run dev     # Development (watch mode)
npm start       # Production
npm run prod    # Production env
```

---

## ❌ Häufige Fehler

### ❗ "Cannot find module express"
```bash
npm install
```

---

### ❗ "GROQ_API_KEY missing"
👉 .env Datei prüfen

---

### ❗ Server startet nicht
👉 Port 3000 frei machen

---

## 🏗️ Tech Stack

- Node.js
- Express
- Groq SDK
- dotenv
- cors
- helmet
- rate-limit
- compression

---

## 📄 Lizenz

MIT License

---

## ⭐ Support

Wenn dir das Projekt gefällt:
- ⭐ GitHub Star geben
- 🔁 teilen

---

## 👤 Autor

Dein Name  
GitHub: @DEIN_USERNAME
