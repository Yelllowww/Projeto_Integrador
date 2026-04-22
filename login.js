document.getElementById('loginForm').addEventListener('submit', function(event) {
    // Impede o recarregamento automático da página
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (email && senha) {
        console.log("Verificando credenciais para:", email);
        
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
    } else {
        alert("Por favor, preencha o e-mail e a senha.");
    }
});