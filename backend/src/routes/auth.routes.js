const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const router = express.Router();

// Antes: app.post('/cadastrar', ...) dentro do server.js
router.post('/cadastrar', async (req, res) => {
    const { nome, email, senha } = req.body;
    try {
        const senhaHash = await bcrypt.hash(senha, 10);
        await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)',
            [nome, email, senhaHash]
        );
        res.redirect('/homepage.html?cadastro=sucesso');
    } catch (err) {
        res.send("Erro ao cadastrar: " + err.message);
    }
});

// Antes: app.post('/login', ...) dentro do server.js
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (resultado.rows.length === 0) return res.redirect('/homepage.html?erro=1');

        const usuario = resultado.rows[0];
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (senhaCorreta) {
            req.session.logado = true;
            req.session.usuario_id = usuario.id;
            res.redirect('/index.html');
        } else {
            res.redirect('/homepage.html?erro=1');
        }
    } catch (err) {
        res.send("Erro no servidor: " + err.message);
    }
});

// Antes: app.get('/logout', ...) dentro do server.js
router.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/homepage.html');
    });
});

module.exports = router;