import express from "express";
import Groq from "groq-sdk";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// 🔥 Modelle automatisch holen
app.get("/models", async (req, res) => {
  const models = await groq.models.list();
  res.json(models);
});

// Chat
app.post("/chat", async (req, res) => {
  const { message, model } = req.body;

  const response = await groq.chat.completions.create({
    model,
    messages: [{ role: "user", content: message }]
  });

  res.json(response);
});

app.listen(3000, () => {
  console.log("Server läuft");
});