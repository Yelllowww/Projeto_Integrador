const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt'); // O nosso "moedor de carne"
const path = require('path');

const app = express();

// Configurações para o servidor entender os formulários e arquivos HTML
<<<<<<< HEAD
app.use(cors({
    origin: '*', // Permite requisições de qualquer origem
    credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Adiciona suporte a JSON também
=======
app.use(cors());
app.use(express.urlencoded({ extended: true }));
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
app.use(express.static(__dirname)); // Permite ler o login.html e teste.html da mesma pasta

// Configuração do "Cofre" (PostgreSQL)
const pool = new Pool({
    user: 'casaos',
<<<<<<< HEAD
    host: '192.168.15.8',
    database: 'VidWiseDB', 
    password: 'casaos',
    port: 5432,
});
// Testa a conexão com o banco
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ ERRO ao conectar ao banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados com sucesso!');
        release();
    }
});
=======
    host: 'casaos',
    database: 'VidWiseDB', 
    password: 'casaos', // Sua senha real
    port: 5432, // A sua porta do DBeaver
});

>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
// --- ROTA DE CADASTRO ---
app.post('/cadastrar', async (req, res) => {
    const { nome, email, senha } = req.body; 
    
    try {
        // Tritura a senha antes de salvar
        const senhaHash = await bcrypt.hash(senha, 10);
        
        // Salva no banco de dados
        await pool.query(
            'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)', 
            [nome, email, senhaHash] 
        );
        res.send("Cadastrado com sucesso! Volte para a página de login e tente entrar.");
    } catch (err) {
        res.send("Erro ao cadastrar: " + err.message);
    }
});

// --- ROTA DE LOGIN ---
app.post('/login', async (req, res) => {
    const { email, senha } = req.body; 

    try {
        // Busca o usuário no banco pelo e-mail
        const resultado = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        // Se a lista voltar vazia, o e-mail não existe
        if (resultado.rows.length === 0) {
            return res.send("Acesso Negado: E-mail não encontrado!");
        }

        // Pega a "ficha" do usuário encontrado
        const usuario = resultado.rows[0];
        
        // Compara a senha digitada com a "carne moída" do banco
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (senhaCorreta) {
            // Se bater, manda o usuário para a área restrita
<<<<<<< HEAD
            res.redirect('/index.html'); 
=======
            res.redirect('/teste.html'); 
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
        } else {
            // Se não bater, barra na porta
            res.send("Acesso Negado: Senha incorreta!");
        }
    } catch (err) {
        res.send("Erro no servidor: " + err.message);
    }
});

// Liga o servidor na porta 3000
<<<<<<< HEAD
app.listen(3000, () => {
    console.log("Servidor rodando! Garçom pronto na porta 3000.");
    console.log("Acesse: http://localhost:3000");
});
=======
app.listen(3000, () => console.log("Servidor rodando! Garçom pronto na porta 3000."));
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
