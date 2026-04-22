const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const { ApifyClient } = require("apify");
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session'); // BIBLIOTECA DE SEGURANÇA

const app = express();
const PORT = process.env.PORT || 3001;

// ---------------------------------------------------------
// 1. CONFIGURAÇÕES BÁSICAS
// ---------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ---------------------------------------------------------
// 2. A MÁQUINA DE CRACHÁS (Sessão)
// ---------------------------------------------------------
app.use(session({
    secret: 'meu_segredo_super_seguro_vidwise', 
    resave: false,
    saveUninitialized: false
}));

// ---------------------------------------------------------
// 3. O PORTEIRO E A CATRACA DE SEGURANÇA
// ---------------------------------------------------------
app.get('/', (req, res) => {
    if (req.session.logado) {
        res.redirect('/index.html'); 
    } else {
        res.redirect('/login.html'); 
    }
});

app.use((req, res, next) => {
    // Impede o acesso direto ao index.html se não estiver logado
    if (req.path === '/index.html' && !req.session.logado) {
        return res.redirect('/login.html'); 
    }
    next(); 
});

// ---------------------------------------------------------
// 4. CONFIGURAÇÃO DO COFRE (POSTGRESQL)
// ---------------------------------------------------------
const pool = new Pool({
    user: 'casaos',
    host: '192.168.15.8',
    database: 'VidWiseDB', 
    // Usando a variável de ambiente, mas com fallback para a senha antiga caso você não tenha criado o .env ainda
    password: process.env.DB_SENHA || 'casaos', 
    port: 5432,
});

// ---------------------------------------------------------
// 5. ROTAS DE AUTENTICAÇÃO
// ---------------------------------------------------------
app.post('/cadastrar', async (req, res) => {
    const { nome, email, senha } = req.body; 
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)', 
            [nome, email, senhaHash] 
        );
        res.send("Cadastrado com sucesso! Volte para a página de login.");
    } catch (err) {
        res.send("Erro ao cadastrar: " + err.message);
    }
});

app.post('/login', async (req, res) => {
    const { email, senha } = req.body; 
    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (resultado.rows.length === 0) return res.redirect('/login.html?erro=1'); 

        const usuario = resultado.rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (senhaCorreta) {
            req.session.logado = true; // Cria a sessão VIP
            res.redirect('/index.html'); 
        } else {
            res.redirect('/login.html?erro=1');
        }
    } catch (err) {
        res.send("Erro no servidor: " + err.message);
    }
});

// ---------------------------------------------------------
// 6. ROTAS DE IA (DIFY) - SEPARADAS CONFORME A ARQUITETURA
// ---------------------------------------------------------

// OPÇÃO 1 (FLUXO DE BAIXO): Sem link, apenas conversa normal
app.post("/pergunta", async (req, res) => {
  try {
    const { pergunta } = req.body; 
    if (!pergunta) return res.status(400).json({ ok: false, erro: "Campo 'pergunta' é obrigatório" });

    const payload = { 
        inputs: {}, // Sem variáveis extras, fluxo genérico
        query: pergunta, 
        response_mode: "blocking", 
        user: "usuario-vidwise" 
    };

    console.log("🚀 Enviando para /pergunta (Chat Genérico)");

    const difyResp = await axios.post(
        "https://api.dify.ai/v1/chat-messages", 
        payload, 
        { headers: { Authorization: `Bearer ${process.env.DIFY_API_KEY}`, "Content-Type": "application/json" } }
    );

    res.json({ ok: true, resposta: difyResp.data });
  } catch (err) {
    const erroDify = err?.response?.data || err.message;
    console.error("🚨 ERRO DIFY (/pergunta):", erroDify);
    res.status(500).json({ ok: false, erro: typeof erroDify === 'object' ? JSON.stringify(erroDify) : erroDify });
  }
});

// OPÇÃO 2 (FLUXO DE CIMA): Com link, envia o link E OS DADOS DO BANCO pro Dify
app.post("/chat-com-link", async (req, res) => {
  try {
    const { pergunta, link } = req.body;
    if (!link || !pergunta) return res.status(400).json({ ok: false, erro: "Campos obrigatórios faltando" });
    
    // 🔍 BUSCA NO BANCO DE DADOS (Faltava isso nesta rota!)
    let contextoBanco = "Nenhum dado encontrado no banco.";
    const queryBanco = await pool.query(`
        SELECT c.titulo_canal, c.total_inscritos, c.total_visualizacoes as views_totais,
               v.titulo_video, v.visualizacoes as views_video, v.duracao
        FROM canais_youtube c
        LEFT JOIN videos_youtube v ON c.id_canal = v.id_canal
        WHERE c.url_canal = $1
        LIMIT 15
    `, [link]);

    if (queryBanco.rows.length > 0) {
        contextoBanco = JSON.stringify(queryBanco.rows);
    }

    // 📦 EMPACOTA O LINK E OS DADOS JUNTOS
    const payload = { 
        inputs: { 
            link: link,                // João usa isso no fluxo
            dados_canal: contextoBanco // A IA usa isso para não alucinar!
        }, 
        query: pergunta, 
        response_mode: "blocking", 
        user: "usuario-vidwise" 
    };

    const difyResp = await axios.post(
        "https://api.dify.ai/v1/chat-messages", 
        payload, 
        { headers: { Authorization: `Bearer ${process.env.DIFY_API_KEY}`, "Content-Type": "application/json" } }
    );

    res.json({ ok: true, resposta: difyResp.data });
  } catch (err) {
    const erroDify = err?.response?.data || err.message;
    console.error("🚨 ERRO DIFY (/chat-com-link):", erroDify);
    res.status(500).json({ ok: false, erro: typeof erroDify === 'object' ? JSON.stringify(erroDify) : erroDify });
  }
});
// ---------------------------------------------------------
// 7. ROTA DE RASPAGEM E SALVAMENTO - LÓGICA UPSERT (NÃO DUPLICA)
// ---------------------------------------------------------
app.post("/youtube", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ ok: false, erro: "Informe o link do canal." });
    
    console.log("🕷️ Iniciando raspagem no Apify para:", url);
    const apifyClient = new ApifyClient({ token: process.env.APIFY_TOKEN });
    const run = await apifyClient.actor("streamers/youtube-channel-scraper").call({ startUrls: [{ url }], maxResults: 50 });
    const { items = [] } = await apifyClient.dataset(run.defaultDatasetId).listItems();
    
    const videoItems = items.filter(i => i.type === "video" || i.itemType === "video" || (i.title && i.type !== "channel"));
    const about = items.find(i => i.type === "channel") || videoItems[0]?.aboutChannelInfo || {};
    
    const channelInfo = {
      title: about.channelName || about.title || "Canal",
      description: about.channelDescription || about.description || "",
      avatarUrl: about.channelAvatarUrl || about.avatar || "",
      subscribers: about.numberOfSubscribers ?? about.subscribers ?? 0,
      channelTotalViews: about.channelTotalViews ?? about.totalViews ?? 0
    };

    // 🌟 Verifica se o canal já existe no banco
    const verificaCanal = await pool.query('SELECT id_canal FROM canais_youtube WHERE url_canal = $1', [url]);
    let idCanal;

    if (verificaCanal.rows.length > 0) {
        // Se EXISTE, atualiza os dados do canal (inscritos, views, etc)
        idCanal = verificaCanal.rows[0].id_canal;
        await pool.query(
            `UPDATE canais_youtube 
             SET titulo_canal = $1, descricao_canal = $2, foto_perfil = $3, total_inscritos = $4, total_visualizacoes = $5 
             WHERE id_canal = $6`,
            [channelInfo.title, channelInfo.description, channelInfo.avatarUrl, channelInfo.subscribers, channelInfo.channelTotalViews, idCanal]
        );
        // Deleta os vídeos antigos para colocar os novos raspados
        await pool.query('DELETE FROM videos_youtube WHERE id_canal = $1', [idCanal]);
    } else {
        // Se NÃO EXISTE, cria um novo canal
        const insertCanal = await pool.query(
          `INSERT INTO canais_youtube (url_canal, titulo_canal, descricao_canal, foto_perfil, total_inscritos, total_visualizacoes) 
           VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_canal`,
          [url, channelInfo.title, channelInfo.description, channelInfo.avatarUrl, channelInfo.subscribers, channelInfo.channelTotalViews]
        );
        idCanal = insertCanal.rows[0].id_canal; 
    }
    
    const videoData = videoItems.map(v => ({
      title: v.title || v.videoTitle || "Sem título",
      viewCount: v.viewCount ?? v.views ?? 0,
      duration: v.duration || v.videoDuration || "-",
      date: v.date || v.uploadDate || v.publishedAt || "-"
    }));

    // Salva os Vídeos fresquinhos no Banco
    for (const v of videoData) {
      await pool.query(
        `INSERT INTO videos_youtube (id_canal, titulo_video, visualizacoes, duracao, data_publicacao) 
         VALUES ($1, $2, $3, $4, $5)`,
        [idCanal, v.title, v.viewCount, v.duration, v.date]
      );
    }
    
    console.log(`✅ Raspagem concluída e banco de dados atualizado para: ${channelInfo.title}`);
    res.json({ ok: true, channel: channelInfo, videos: videoData });
  } catch (err) {
    console.error("🚨 ERRO NO SCRAPING/BANCO:", err.message);
    res.status(500).json({ ok: false, erro: err?.response?.data || err.message || String(err) });
  }
});

// ---------------------------------------------------------
// 8. ARQUIVOS ESTÁTICOS (Entrega do HTML/CSS)
// ---------------------------------------------------------
// Sempre no final para não furar a "Catraca de Segurança"
app.use(express.static(__dirname)); 

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});