Ahhh 😄 jetzt hab ich’s verstanden — du willst den kompletten README.md als EINEN Block zum Kopieren.

Hier ist alles sauber fertig 👇

⸻

:::writing{variant=“standard” id=“48392”}

🤖 AI Chat • Intelligenter Assistent

Ein moderner, KI-gestützter Chat-Assistent mit Streaming-Unterstützung, Code-Highlighting und Freemium-Token-System.


⸻

✨ Features

🎨 Benutzeroberfläche
	•	🌙 Dark/Light Mode mit Animation
	•	📱 Responsive Design (Mobile, Tablet, Desktop)
	•	🎨 Modernes UI (Glassmorphism + Gradients)
	•	📂 Sidebar mit Chat-Verlauf & Einstellungen

💬 Chat-Funktionen
	•	⚡ Streaming-Antworten (optional)
	•	🧠 Markdown + Code-Highlighting (20+ Sprachen)
	•	📊 Token-Zähler (Live)
	•	💾 Chat-Verlauf (lokal gespeichert)
	•	📤 Export / Import (JSON)

🔧 Technisch
	•	⚡ Groq API Integration
	•	🛡️ Rate Limiting
	•	⚡ Model-Caching (30 Sekunden)
	•	❤️ Health Check System

🪙 Freemium-System
	•	🆓 1.000.000 Tokens kostenlos
	•	📊 Fortschrittsbalken
	•	⚠️ Warnungen bei 75% & 90%

⸻

🚀 Schnellstart

📦 Voraussetzungen
	•	Node.js >= 18
	•	Groq API Key: https://console.groq.com

⸻

⚙️ Installation

1️⃣ Repository klonen

git clone https://github.com/DEIN_USERNAME/ai-chat.git
cd ai-chat

2️⃣ Abhängigkeiten installieren

npm install

3️⃣ .env Datei erstellen

cp .env.example .env

👉 Danach .env öffnen und API-Key eintragen:

GROQ_API_KEY=dein_api_key_hier

4️⃣ Server starten

npm run dev

oder (Production):

npm start


⸻

🌐 Verwendung
	1.	Server läuft auf:

http://localhost:3000

	2.	Öffne index.html im Browser
	3.	Modell auswählen
	4.	Chat starten 🎉

⸻

📁 Projektstruktur

ai-chat/
├── index.html
├── server.js
├── package.json
├── .env
├── .env.example
└── README.md


⸻

⚙️ Konfiguration (.env)

# 🔑 API Key
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxx

# 🌐 Port
PORT=3000

# 🔒 CORS
ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500,http://localhost:3000,null

# 👑 Admin Secret
ADMIN_SECRET=mein-secret

# 🧪 Environment
NODE_ENV=development


⸻

📡 API Endpoints

Methode	Endpoint	Beschreibung
GET	/	Server Info
GET	/health	Status
GET	/models	Modelle
POST	/chat	Chat
POST	/chat/stream	Streaming
POST	/tokens/estimate	Token


⸻

💬 Beispiel Anfrage

const response = await fetch("http://localhost:3000/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    message: "Erkläre mir Quantenphysik",
    model: "llama-3.3-70b-versatile",
    history: []
  })
});

const data = await response.json();
console.log(data.choices[0].message.content);


⸻

⌨️ Tastenkürzel

Taste	Funktion
Enter	Senden
Shift + Enter	Neue Zeile
Ctrl + K	Neuer Chat
Ctrl + E	Export
ESC	Schließen


⸻

🔧 Scripts

npm start       # Production
npm run dev     # Development (Auto Reload)
npm run prod    # Production Mode


⸻

🐛 Fehlerbehebung

Problem	Lösung
npm fehlt	Node.js installieren
Module Error	npm install
API Key fehlt	.env prüfen
Server läuft nicht	Port checken
Fetch Error	Server starten


⸻

🏗️ Stack

Frontend
	•	HTML, CSS, JavaScript
	•	Highlight.js

Backend
	•	Node.js
	•	Express
	•	Groq SDK

⸻

📄 Lizenz

MIT License

⸻

⭐ Support

Wenn dir das Projekt gefällt:

👉 ⭐ auf GitHub geben
👉 teilen

⸻

👤 Autor

Dein Name
GitHub: @DEIN_USERNAME
:::

⸻

✅ Jetzt kannst du einfach:
	1.	Alles kopieren
	2.	In README.md einfügen
	3.	Git push

⸻
