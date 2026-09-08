const express = require('express');
const pool = require('../config/db');
const { perguntarSemContexto, perguntarComContexto } = require('../services/difyService');

const router = express.Router();

// Antes: app.post('/pergunta', ...) dentro do server.js, com a chamada
// ao axios direto aqui. Agora a chamada ao Dify vive em services/difyService.js.
router.post('/pergunta', async (req, res) => {
    try {
        const { pergunta } = req.body;
        if (!pergunta) {
            return res.status(400).json({ ok: false, erro: "Campo 'pergunta' é obrigatório" });
        }

        console.log("🚀 Enviando para /pergunta (Chat Genérico)");
        const resposta = await perguntarSemContexto(pergunta);
        res.json({ ok: true, resposta });
    } catch (err) {
        const erroDify = err?.response?.data || err.message;
        console.error("🚨 ERRO DIFY (/pergunta):", erroDify);
        res.status(500).json({ ok: false, erro: typeof erroDify === 'object' ? JSON.stringify(erroDify) : erroDify });
    }
});

// Antes: app.post('/chat-com-link', ...) dentro do server.js.
router.post('/chat-com-link', async (req, res) => {
    try {
        const { pergunta, link } = req.body;
        if (!link || !pergunta) {
            return res.status(400).json({ ok: false, erro: "Campos obrigatórios faltando" });
        }

        let contextoBanco = "Nenhum dado encontrado no banco.";
        const queryBanco = await pool.query(
            `SELECT c.titulo_canal, c.total_inscritos, c.total_visualizacoes as views_totais,
                    v.titulo_video, v.visualizacoes as views_video, v.duracao
             FROM canais_youtube c
             LEFT JOIN videos_youtube v ON c.id_canal = v.id_canal
             WHERE c.url_canal = $1
             LIMIT 15`,
            [link]
        );

        if (queryBanco.rows.length > 0) {
            contextoBanco = JSON.stringify(queryBanco.rows);
        }

        const resposta = await perguntarComContexto(pergunta, link, contextoBanco);
        res.json({ ok: true, resposta });
    } catch (err) {
        const erroDify = err?.response?.data || err.message;
        console.error("🚨 ERRO DIFY (/chat-com-link):", erroDify);
        res.status(500).json({ ok: false, erro: typeof erroDify === 'object' ? JSON.stringify(erroDify) : erroDify });
    }
});

module.exports = router;