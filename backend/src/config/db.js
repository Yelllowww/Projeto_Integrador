const { Pool } = require('pg');

// Pool de conexões com o PostgreSQL.
// Antes isso estava criado direto dentro do server.js — agora fica
// isolado aqui, e qualquer outro arquivo que precisar do banco
// simplesmente faz: const pool = require('../config/db');
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'vidwise_db',
    password: process.env.DB_SENHA || 'postgres', // troque isso no .env, não deixe fallback em produção
    port: process.env.DB_PORT || 5432,
});

module.exports = pool;