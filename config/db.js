const { Pool } = require('pg');

// Pool de conexões com o PostgreSQL.
// Antes isso estava criado direto dentro do server.js — agora fica
// isolado aqui, e qualquer outro arquivo que precisar do banco
// simplesmente faz: const pool = require('../config/db');
const pool = new Pool({
    user: process.env.DB_USER || 'casaos',
    host: process.env.DB_HOST || '192.168.15.8',
    database: process.env.DB_NAME || 'VidWiseDB',
    password: process.env.DB_SENHA || 'casaos', // troque isso no .env, não deixe fallback em produção
    port: process.env.DB_PORT || 5432,
});

module.exports = pool;