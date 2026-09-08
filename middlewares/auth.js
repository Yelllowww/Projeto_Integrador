// Middleware que verifica se o usuário está logado (tem sessão ativa).
// Antes essa função estava declarada solta no meio do server.js.
// Uso: app.get('/rota-protegida', verificarAutenticacao, (req, res) => {...})
function verificarAutenticacao(req, res, next) {
    if (!req.session.logado || !req.session.usuario_id) {
        return res.status(401).json({ ok: false, erro: "Não autenticado" });
    }
    next();
}

module.exports = verificarAutenticacao;