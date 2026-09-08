const path = require('path');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const session = require('express-session');

const authRoutes = require('./routes/auth.routes');
const youtubeRoutes = require('./routes/youtube.routes');
const aiRoutes = require('./routes/ai.routes');
const conversasRoutes = require('./routes/conversas.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// Pasta do frontend estático.
// Estrutura real: Projeto_Integrador-main/backend/src/server.js
//              e  Projeto_Integrador-main/frontend/
// Por isso sobe 2 níveis (backend/src -> backend -> raiz) e entra em frontend/.
const FRONTEND_DIR = path.join(__dirname, '..', '..', 'frontend');

// ---------------------------------------------------------
// 1. CONFIGURAÇÕES BÁSICAS
// ---------------------------------------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// ---------------------------------------------------------
// 2. SESSÃO
// ---------------------------------------------------------
app.use(session({
    secret: process.env.SESSION_SECRET || 'troque_isso_no_env',
    resave: false,
    saveUninitialized: false,
}));

// ---------------------------------------------------------
// 3. ROTA RAIZ + CATRACA DE SEGURANÇA
// ---------------------------------------------------------
app.get('/', (req, res) => {
    if (req.session.logado) {
        res.redirect('/index.html');
    } else {
        res.redirect('/homepage.html');
    }
});

app.use((req, res, next) => {
    if (req.path === '/index.html' && !req.session.logado) {
        return res.redirect('/homepage.html');
    }
    next();
});

// ---------------------------------------------------------
// 4. ROTAS
// ---------------------------------------------------------
app.use(authRoutes);
app.use(youtubeRoutes);
app.use(aiRoutes);
app.use(conversasRoutes);

// ---------------------------------------------------------
// 5. ARQUIVOS ESTÁTICOS (frontend)
// Sempre depois das rotas de API, para não furar a "catraca"
// ---------------------------------------------------------
app.use(express.static(FRONTEND_DIR));

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});