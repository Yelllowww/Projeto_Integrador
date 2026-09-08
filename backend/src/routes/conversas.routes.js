const express = require('express');
const pool = require('../config/db');
const verificarAutenticacao = require('../middlewares/auth');

const router = express.Router();

// Antes: essas 5 rotas existiam no server.js, mas *duplicadas duas vezes*
// (bloco "9. ROTAS DE CONVERSAS PERSISTENTES" aparecia repetido). O Express
// simplesmente ignorava a segunda definição, mas ficava lixo no arquivo.
// Aqui existe só uma vez.

// GET /conversas - Listar todas as conversas do usuário
router.get('/conversas', verificarAutenticacao, async (req, res) => {
    try {
        const resultado = await pool.query(
            'SELECT id, titulo, criacao FROM conversas WHERE usuario_id = $1 ORDER BY criacao DESC',
            [req.session.usuario_id]
        );
        res.json({ ok: true, conversas: resultado.rows });
    } catch (err) {
        console.error('Erro ao listar conversas:', err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});

// POST /conversas/nova - Criar nova conversa
router.post('/conversas/nova', verificarAutenticacao, async (req, res) => {
    try {
        const { titulo } = req.body;
        const novoTitulo = titulo || `Conversa ${new Date().toLocaleDateString('pt-BR')}`;

        const resultado = await pool.query(
            'INSERT INTO conversas (usuario_id, titulo) VALUES ($1, $2) RETURNING id, titulo, criacao',
            [req.session.usuario_id, novoTitulo]
        );

        res.json({ ok: true, conversa: resultado.rows[0] });
    } catch (err) {
        console.error('Erro ao criar conversa:', err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});

// GET /conversa/:id - Obter conversa com todas as mensagens
router.get('/conversa/:id', verificarAutenticacao, async (req, res) => {
    try {
        const { id } = req.params;

        const conversa = await pool.query(
            'SELECT * FROM conversas WHERE id = $1 AND usuario_id = $2',
            [id, req.session.usuario_id]
        );

        if (conversa.rows.length === 0) {
            return res.status(404).json({ ok: false, erro: "Conversa não encontrada" });
        }

        const mensagens = await pool.query(
            'SELECT id, dados_conversa, tokens, criacao FROM mensagens WHERE conversa_id = $1 ORDER BY criacao ASC',
            [id]
        );

        res.json({
            ok: true,
            conversa: conversa.rows[0],
            mensagens: mensagens.rows.map((m) => ({
                ...m,
                dados_conversa: typeof m.dados_conversa === 'string' ? JSON.parse(m.dados_conversa) : m.dados_conversa,
            })),
        });
    } catch (err) {
        console.error('Erro ao obter conversa:', err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});

// POST /conversa/:id/mensagem - Salvar nova mensagem
router.post('/conversa/:id/mensagem', verificarAutenticacao, async (req, res) => {
    try {
        const { id } = req.params;
        const { pergunta, resposta, tokens } = req.body;

        const conversa = await pool.query(
            'SELECT id FROM conversas WHERE id = $1 AND usuario_id = $2',
            [id, req.session.usuario_id]
        );

        if (conversa.rows.length === 0) {
            return res.status(404).json({ ok: false, erro: "Conversa não encontrada" });
        }

        const dadosConversa = {
            pergunta,
            resposta,
            timestamp: new Date().toISOString(),
        };

        const resultado = await pool.query(
            'INSERT INTO mensagens (conversa_id, dados_conversa, tokens, criacao) VALUES ($1, $2, $3, NOW()) RETURNING id, dados_conversa, tokens, criacao',
            [id, JSON.stringify(dadosConversa), tokens || 0]
        );

        res.json({ ok: true, mensagem: resultado.rows[0] });
    } catch (err) {
        console.error('Erro ao salvar mensagem:', err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});

// PUT /conversa/:id/titulo - Atualizar título da conversa
router.put('/conversa/:id/titulo', verificarAutenticacao, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo } = req.body;

        const conversa = await pool.query(
            'SELECT id FROM conversas WHERE id = $1 AND usuario_id = $2',
            [id, req.session.usuario_id]
        );

        if (conversa.rows.length === 0) {
            return res.status(404).json({ ok: false, erro: "Conversa não encontrada" });
        }

        const resultado = await pool.query(
            'UPDATE conversas SET titulo = $1 WHERE id = $2 RETURNING id, titulo, criacao',
            [titulo, id]
        );

        res.json({ ok: true, conversa: resultado.rows[0] });
    } catch (err) {
        console.error('Erro ao atualizar conversa:', err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});

// DELETE /conversa/:id - Deletar conversa
router.delete('/conversa/:id', verificarAutenticacao, async (req, res) => {
    try {
        const { id } = req.params;

        const conversa = await pool.query(
            'SELECT id FROM conversas WHERE id = $1 AND usuario_id = $2',
            [id, req.session.usuario_id]
        );

        if (conversa.rows.length === 0) {
            return res.status(404).json({ ok: false, erro: "Conversa não encontrada" });
        }

        await pool.query('DELETE FROM conversas WHERE id = $1', [id]);

        res.json({ ok: true, mensagem: "Conversa deletada com sucesso" });
    } catch (err) {
        console.error('Erro ao deletar conversa:', err.message);
        res.status(500).json({ ok: false, erro: err.message });
    }
});

module.exports = router;