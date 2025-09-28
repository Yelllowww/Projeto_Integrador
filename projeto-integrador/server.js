const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

// 🔹 Rota raiz só para teste rápido
app.get("/", (req, res) => {
  res.send("🚀 Backend Dify rodando!");
});

// 🔹 Rota de teste simples com Dify
app.get("/teste-dify", async (req, res) => {
  try {
    const resp = await axios.post(
      "https://api.dify.ai/v1/chat-messages", // ou completion-messages se for outro tipo de app
      {
        inputs: {},
        query: "Diga olá em português",
        response_mode: "blocking",
        user: "teste123"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ ok: true, resposta: resp.data });
  } catch (err) {
    console.error("❌ Erro no teste:", err?.response?.data || err.message);
    res.status(500).json({
      ok: false,
      erro: err?.response?.data || err.message
    });
  }
});

// 🔹 Rota principal para perguntas personalizadas
app.post("/pergunta", async (req, res) => {
  try {
    const { pergunta, dados } = req.body;
    if (!pergunta) {
      return res.status(400).json({ error: "Campo 'pergunta' é obrigatório" });
    }

    const payload = {
      inputs: { dados_canal: dados || {} },
      query: pergunta,
      response_mode: "blocking",
      user: "aluno-backend"
    };

    const difyResp = await axios.post(
      "https://api.dify.ai/v1/chat-messages", // ajuste conforme o tipo de app no Dify
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json({ ok: true, resposta: difyResp.data });
  } catch (err) {
    console.error("❌ Erro ao chamar Dify:", err?.response?.data || err.message);
    res.status(500).json({
      ok: false,
      erro: err?.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
