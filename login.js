document.getElementById('loginForm').addEventListener('submit', function(event) {
    // Impede o recarregamento automático da página
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (email && senha) {
        console.log("Verificando credenciais para:", email);
<<<<<<< HEAD
        
        // Envia os dados para o servidor
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                email: email,
                senha: senha
            })
        })
        .then(response => {
            console.log("Status da resposta:", response.status);
            return response.text();
        })
        .then(data => {
            console.log("Resposta do servidor:", data);
            // Se foi redirecionado para index.html, a requisição foi bem-sucedida
            if (response.redirected) {
                window.location.href = response.url;
            }
        })
        .catch(error => {
            console.error("Erro na requisição:", error);
            alert("Erro ao conectar ao servidor: " + error.message);
        });
=======
        alert("Tentativa de acesso solicitada para: " + email);
        // FUTURAMENTE: Aqui entrará o código (ex: fetch ou axios) 
        // para enviar os dados para a API/Banco de Dados verificar se a senha está correta.
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
    } else {
        alert("Por favor, preencha o e-mail e a senha.");
    }
});