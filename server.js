// server.js - produção atualizado (Dify + Apify)
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const { ApifyClient } = require("apify"); // adicionado Apify

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3001;

// rota raiz
app.get("/", (req, res) => {
  res.send("🚀 Backend Dify + Apify rodando!");
});

// rota de teste Dify
app.get("/teste-dify", async (req, res) => {
  try {
    const resp = await axios.post(
      "https://api.dify.ai/v1/chat-messages",
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
    res.status(500).json({ ok: false, erro: err?.response?.data || err.message });
  }
});

// rota /pergunta (Dify) - igual ao que você tinha
app.post("/pergunta", async (req, res) => {
  try {
    const { pergunta, dados } = req.body;
    if (!pergunta) return res.status(400).json({ ok:false, erro: "Campo 'pergunta' é obrigatório" });

    const payload = {
      inputs: { dados_canal: dados || {} },
      query: pergunta,
      response_mode: "blocking",
      user: "aluno-backend"
    };

    const difyResp = await axios.post(
      "https://api.dify.ai/v1/chat-messages",
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
    res.status(500).json({ ok: false, erro: err?.response?.data || err.message });
  }
});

// rota /youtube - utiliza Apify actor streamers/youtube-channel-scraper
app.post("/youtube", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ ok:false, erro: "Informe o link do canal." });

    if (!process.env.APIFY_TOKEN) {
      return res.status(500).json({ ok:false, erro: "APIFY_TOKEN não configurado no .env" });
    }

    const ACTOR_ID = "streamers/youtube-channel-scraper";
    const apifyClient = new ApifyClient({ token: process.env.APIFY_TOKEN });

    // start actor run
    const run = await apifyClient.actor(ACTOR_ID).call({
      startUrls: [{ url }],
      maxResults: 50
    });

    // read dataset items
    const { items = [] } = await apifyClient.dataset(run.defaultDatasetId).listItems();

    // filter videos
    const videoItems = items.filter(i => i.type === "video" || i.itemType === "video" || (i.title && i.type !== 'channel'));
    const about = (items.find(i => i.type === 'channel') || videoItems[0]?.aboutChannelInfo || {}) ;

    const channelInfo = {
      title: about.channelName || about.title || "Canal",
      description: about.channelDescription || about.description || "",
      avatarUrl: about.channelAvatarUrl || about.avatar || "",
      subscribers: about.numberOfSubscribers ?? about.subscribers ?? 0,
      channelTotalVideos: about.channelTotalVideos ?? about.totalVideos ?? 0,
      channelTotalViews: about.channelTotalViews ?? about.totalViews ?? 0
    };

    const videoData = videoItems.map(v => ({
      title: v.title || v.videoTitle || "Sem título",
      viewCount: v.viewCount ?? v.views ?? 0,
      duration: v.duration || v.videoDuration || "-",
      date: v.date || v.uploadDate || v.publishedAt || "-"
    }));

    res.json({ ok: true, channel: channelInfo, videos: videoData });

  } catch (err) {
    console.error("❌ Erro no /youtube:", err?.response?.data || err.message);
    res.status(500).json({ ok: false, erro: err?.response?.data || err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
