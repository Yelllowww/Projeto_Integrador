const express = require('express');
const pool = require('../config/db');
const { rasparCanalYoutube } = require('../services/apifyService');

const router = express.Router();

// Antes: app.post('/youtube', ...) dentro do server.js, com a lógica
// do Apify misturada aqui dentro. Agora a raspagem em si vive em
// services/apifyService.js e esta rota só orquestra: raspa -> salva -> responde.
router.post('/youtube', async (req, res) => {
    try {
        const { url } = req.body;
        if (!url) return res.status(400).json({ ok: false, erro: "Informe o link do canal." });

        console.log("🕷️ Iniciando raspagem no Apify para:", url);
        const { channelInfo, videoData } = await rasparCanalYoutube(url);

        // Verifica se o canal já existe no banco (lógica upsert)
        const verificaCanal = await pool.query(
            'SELECT id_canal FROM canais_youtube WHERE url_canal = $1',
            [url]
        );
        let idCanal;

        if (verificaCanal.rows.length > 0) {
            idCanal = verificaCanal.rows[0].id_canal;
            await pool.query(
                `UPDATE canais_youtube
                 SET titulo_canal = $1, descricao_canal = $2, foto_perfil = $3,
                     total_inscritos = $4, total_visualizacoes = $5
                 WHERE id_canal = $6`,
                [
                    channelInfo.title,
                    channelInfo.description,
                    channelInfo.avatarUrl,
                    channelInfo.subscribers,
                    channelInfo.channelTotalViews,
                    idCanal,
                ]
            );
            await pool.query('DELETE FROM videos_youtube WHERE id_canal = $1', [idCanal]);
        } else {
            const insertCanal = await pool.query(
                `INSERT INTO canais_youtube
                    (url_canal, titulo_canal, descricao_canal, foto_perfil, total_inscritos, total_visualizacoes)
                 VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_canal`,
                [
                    url,
                    channelInfo.title,
                    channelInfo.description,
                    channelInfo.avatarUrl,
                    channelInfo.subscribers,
                    channelInfo.channelTotalViews,
                ]
            );
            idCanal = insertCanal.rows[0].id_canal;
        }

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

module.exports = router;