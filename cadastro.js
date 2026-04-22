// Debug: Verifica se o servidor está rodando
console.log("Página carregada. Testando disponibilidade do servidor...");

fetch('/cadastrar', {
    method: 'OPTIONS'
}).then(response => {
    console.log("✅ Servidor disponível! Status:", response.status);
}).catch(error => {
    console.error("❌ Servidor NÃO está disponível:", error.message);
    alert("AVISO: Servidor não está respondendo!\n\nErro: " + error.message + 
          "\n\nVerifique se:\n1. O servidor está rodando\n2. A porta 3000 está correta\n3. O firewall não está bloqueando");
});

document.getElementById('registerForm').addEventListener('submit', function(event) {
    // Impede o formulário de ser enviado da maneira padrão (recarregando a página)
    event.preventDefault();

    const nome = document.querySelector('input[name="nome"]').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (nome && email && senha) {
        console.log("Tentativa de registro para:", { nome, email });
        
        // Envia os dados para o servidor
        fetch('/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                nome: nome,
                email: email,
                senha: senha
            })
        })
        .then(response => response.text())
        .then(data => {
            console.log("Resposta do servidor:", data);
            alert(data); // Mostra a mensagem do servidor
            if (data.includes("sucesso")) {
                // Se deu sucesso, redireciona para login
                window.location.href = '/login.html';
            }
        })
        .catch(error => {
            console.error("Erro na requisição:", error);
            alert("Erro ao conectar ao servidor: " + error.message);
        });
    } else {
        alert("Por favor, preencha todos os campos.");
    }
});