// server.js - produção atualizado (Dify + Apify)
const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const { ApifyClient } = require("apify");
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
const session = require('express-session'); // BIBLIOTECA DE SEGURANÇA
<<<<<<< HEAD
=======

const { ApifyClient } = require("apify"); // adicionado Apify
const { link } = require("fs");
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27

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

<<<<<<< HEAD
=======
const checkAuth = (req, res, next) => {
    if (!req.session.logado || !req.session.usuario_id) {
        return res.status(401).json({ ok: false, erro: "Você não está autenticado. Faça login primeiro." });
    }
    next();
};
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
// ---------------------------------------------------------
// 4. CONFIGURAÇÃO DO COFRE (POSTGRESQL)
// ---------------------------------------------------------
const pool = new Pool({
<<<<<<< HEAD
    user: 'casaos',
    host: '192.168.15.8',
    database: 'VidWiseDB', 
    // Usando a variável de ambiente, mas com fallback para a senha antiga caso você não tenha criado o .env ainda
    password: process.env.DB_SENHA || 'casaos', 
=======
    user: 'postgres',
    host: 'localhost',
    database: 'postgres', 
    // Usando a variável de ambiente, mas com fallback para a senha antiga caso você não tenha criado o .env ainda
    password: process.env.DB_SENHA || 'miguelaraujosd', 
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
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
<<<<<<< HEAD
=======
            res.session.usuario_id = usuario.id;
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
            res.redirect('/index.html'); 
        } else {
            res.redirect('/login.html?erro=1');
        }
    } catch (err) {
        res.send("Erro no servidor: " + err.message);
    }
<<<<<<< HEAD
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
=======
});

app.post('/conversa/criar', checkAuth, async (req, res) => {
    const { titulo } = req.body;
    const usuario_id = req.session.usuario_id;

    try {
        // Se não passou título, gera um padrão
        const tituloConversa = titulo || `Conversa de ${new Date().toLocaleDateString('pt-BR')}`;

        // Insere a conversa na tabela
        const resultado = await pool.query(
            'INSERT INTO conversas (usuario_id, titulo, criacao) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id, titulo, criacao',
            [usuario_id, tituloConversa]
        );

        const conversa = resultado.rows[0];
        res.json({ 
            ok: true, 
            conversa_id: conversa.id, 
            titulo: conversa.titulo,
            mensagem: "Conversa criada com sucesso!" 
        });
    } catch (err) {
        console.error("Erro ao criar conversa:", err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});

// Salvar uma mensagem em uma conversa
app.post('/conversa/:conversa_id/mensagem', checkAuth, async (req, res) => {
    const conversa_id = req.params.conversa_id;
    const { pergunta, resposta, tokens } = req.body;
    const usuario_id = req.session.usuario_id;

    try {
        // Verifica se a conversa pertence ao usuário
        const verificaConversa = await pool.query(
            'SELECT id FROM conversas WHERE id = $1 AND usuario_id = $2',
            [conversa_id, usuario_id]
        );

        if (verificaConversa.rows.length === 0) {
            return res.status(403).json({ ok: false, erro: "Você não tem acesso a esta conversa." });
        }

        // Cria um objeto JSONB com pergunta + resposta
        const dados_conversa = {
            pergunta: pergunta,
            resposta: resposta,
            timestamp: new Date().toISOString()
        };

        // Insere a mensagem
        await pool.query(
            'INSERT INTO mensagens (conversa_id, dados_conversa, tokens, criacao) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
            [conversa_id, JSON.stringify(dados_conversa), tokens || 0]
        );

        res.json({ ok: true, mensagem: "Mensagem salva com sucesso!" });
    } catch (err) {
        console.error("❌ Erro ao salvar mensagem:", err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});
// Listar todas as conversas do usuário
app.get('/conversa/listar', checkAuth, async (req, res) => {
    const usuario_id = req.session.usuario_id;

    try {
        // Busca todas as conversas do usuário, ordenadas por mais recentes
        const resultado = await pool.query(
            'SELECT id, titulo, criacao FROM conversas WHERE usuario_id = $1 ORDER BY criacao DESC',
            [usuario_id]
        );

        res.json({ 
            ok: true, 
            total: resultado.rows.length,
            conversas: resultado.rows 
        });
    } catch (err) {
        console.error("❌ Erro ao listar conversas:", err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});
// Recuperar todas as mensagens de uma conversa
app.get('/conversa/:conversa_id/mensagens', checkAuth, async (req, res) => {
    const conversa_id = req.params.conversa_id;
    const usuario_id = req.session.usuario_id;

    try {
        // Verifica se a conversa pertence ao usuário
        const verificaConversa = await pool.query(
            'SELECT id FROM conversas WHERE id = $1 AND usuario_id = $2',
            [conversa_id, usuario_id]
        );

        if (verificaConversa.rows.length === 0) {
            return res.status(403).json({ ok: false, erro: "Você não tem acesso a esta conversa." });
        }

        // Busca todas as mensagens da conversa
        const resultado = await pool.query(
            'SELECT id, dados_conversa, tokens, criacao FROM mensagens WHERE conversa_id = $1 ORDER BY criacao ASC',
            [conversa_id]
        );

        res.json({ 
            ok: true,
            total: resultado.rows.length,
            mensagens: resultado.rows 
        });
    } catch (err) {
        console.error("❌ Erro ao recuperar mensagens:", err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});

// ---------------------------------------------------------
// 6. ROTAS DE IA (DIFY) - SEPARADAS CONFORME A ARQUITETURA
// ---------------------------------------------------------

// OPÇÃO 1 (FLUXO DE BAIXO): Sem link, apenas conversa normal
app.post("/pergunta", checkAuth, async (req, res) => {
  try {
    const { pergunta, conversa_id } = req.body;
    const usuario_id = req.session.usuario_id;
    if (!pergunta) return res.status(400).json({ ok: false, erro: "Campo 'pergunta' é obrigatório" });
    let finalConversa_id = conversa_id;
    if (!conversa_id) {
        const novaConversa = await pool.query(
            'INSERT INTO conversas (usuario_id, titulo, criacao) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id',
            [usuario_id, `Conversa de ${new Date().toLocaleDateString('pt-BR')}`]
        );
        finalConversa_id = novaConversa.rows[0].id;
    }

    // Verifica se a conversa pertence ao usuário
    const verificaConversa = await pool.query(
        'SELECT id FROM conversas WHERE id = $1 AND usuario_id = $2',
        [finalConversa_id, usuario_id]
    );
    if (verificaConversa.rows.length === 0) {
        return res.status(403).json({ ok: false, erro: "Conversa inválida." });
    }
    const payload = { 
        inputs: {}, // Sem variáveis extras, fluxo genérico
        query: pergunta, 
        response_mode: "blocking", 
        user: 'usuario-${usuario_id}' 
    };

    console.log("🚀 Enviando para /pergunta (Chat Genérico)");

    const difyResp = await axios.post(
        "https://api.dify.ai/v1/chat-messages", 
        payload, 
        { headers: { Authorization: `Bearer ${process.env.DIFY_API_KEY}`, "Content-Type": "application/json" } }
    );
    const resposta = difyResp.data;
    const tokens = difyResp.data?.usage?.total_tokens || 0; // Extrair tokens usados

    //SALVA PERGUNTA + RESPOSTA NO BANCO
    const dados = {
        pergunta: pergunta,
        resposta: resposta,
        link_analisado: link,
        timestamp: new Date().toISOString()
    };

    await pool.query(
        'INSERT INTO mensagens (conversa_id, dados_conversa, tokens, criacao) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)',
        [finalConversa_id, JSON.stringify(dados), tokens]
    );

    res.json({ 
        ok: true, 
        resposta: resposta,
        conversa_id: finalConversa_id
    });
  } catch (err) {
    const erroDify = err?.response?.data || err.message;
    console.error("🚨 ERRO DIFY (/pergunta):", erroDify);
    res.status(500).json({ ok: false, erro: typeof erroDify === 'object' ? JSON.stringify(erroDify) : erroDify });
  }
});

// OPÇÃO 2 (FLUXO DE CIMA): Com link, envia o link E OS DADOS DO BANCO pro Dify
app.post("/chat-com-link", checkAuth, async (req, res) => {
  try {
    const { pergunta, link } = req.body;
    const usuario_id = req.session.usuario_id;
    if (!link || !pergunta) return res.status(400).json({ ok: false, erro: "Campos obrigatórios faltando" });
    // Se não passou conversa_id, cria uma nova
    let finalConversa_id = conversa_id;
    if (!conversa_id) {
        const novaConversa = await pool.query(
            'INSERT INTO conversas (usuario_id, titulo, criacao) VALUES ($1, $2, CURRENT_TIMESTAMP) RETURNING id',
            [usuario_id, `Análise: ${link.substring(0, 50)}...`]
        );
        finalConversa_id = novaConversa.rows[0].id;
    }

    // Verifica se a conversa pertence ao usuário
    const verificaConversa = await pool.query(
        'SELECT id FROM conversas WHERE id = $1 AND usuario_id = $2',
        [finalConversa_id, usuario_id]
    );
    if (verificaConversa.rows.length === 0) {
        return res.status(403).json({ ok: false, erro: "Conversa inválida." });
    }

    //BUSCA NO BANCO DE DADOS
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

    //EMPACOTA O LINK E OS DADOS JUNTOS
    const payload = { 
        inputs: { 
            link: link,                // João usa isso no fluxo
            dados_canal: contextoBanco // A IA usa isso para não alucinar!
        }, 
        query: pergunta, 
        response_mode: "blocking", 
        user: 'usuario-${usuario_id}' 
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
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
<<<<<<< HEAD
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

=======
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

>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
// ---------------------------------------------------------
// 8. ARQUIVOS ESTÁTICOS (Entrega do HTML/CSS)
// ---------------------------------------------------------
// Sempre no final para não furar a "Catraca de Segurança"
app.use(express.static(__dirname)); 

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});