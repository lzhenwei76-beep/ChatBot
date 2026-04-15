# 🤖 AI Chat • Setup Guide

## 🧾 Voraussetzungen installieren

### Node.js installieren
https://nodejs.org  
➡️ LTS Version herunterladen und installieren

### Git installieren (optional)
https://git-scm.com/downloads  

---

## 🚀 Projekt Setup

### 1. Repository klonen
```bash
git clone https://github.com/lzhenwei76-beep/ChatBot.git
cd ChatBot
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. .env Datei erstellen
```bash
cp .env.example .env
```
Info: Hier ist es kein muss. Nur wenn du dein eigens GROQ API GEY haben willst.

### 4. API Key eintragen

```env
GROQ_API_KEY=dein_api_key_hier
```

---

## 🔑 API Key bekommen

https://console.groq.com  
➡️ Account erstellen  
➡️ API Key kopieren  
➡️ in `.env` einfügen  

---

## ▶️ Server starten

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

---

## 🌐 Anwendung öffnen

```text
http://localhost:3000
```

ODER:

```text
index.html öffnen (Doppelklick)
```

---

## 🔧 Wichtige Befehle

```bash
npm install        # installiert alle Pakete
npm run dev        # Dev Server starten
npm start          # Production starten
node server.js     # Direkt starten
```

---

## 🐛 Fehlerbehebung

### npm wird nicht erkannt
➡️ Node.js installieren

### Module fehlen
```bash
npm install
```

### API Key Fehler
➡️ `.env` prüfen

### Server startet nicht
➡️ Port prüfen (3000)

---

## 🎉 Fertig

Dein AI Chat läuft jetzt 🚀
