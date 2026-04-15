document.getElementById('loginForm').addEventListener('submit', function(event) {
    // Impede o recarregamento automático da página
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (email && senha) {
        console.log("Verificando credenciais para:", email);
        alert("Tentativa de acesso solicitada para: " + email);
        // FUTURAMENTE: Aqui entrará o código (ex: fetch ou axios) 
        // para enviar os dados para a API/Banco de Dados verificar se a senha está correta.
    } else {
        alert("Por favor, preencha o e-mail e a senha.");
    }
});