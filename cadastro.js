<<<<<<< HEAD
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

=======
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
document.getElementById('registerForm').addEventListener('submit', function(event) {
    // Impede o formulário de ser enviado da maneira padrão (recarregando a página)
    event.preventDefault();

<<<<<<< HEAD
    const nome = document.querySelector('input[name="nome"]').value;
=======
    const nome = document.getElementById('name').value;
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (nome && email && senha) {
        console.log("Tentativa de registro para:", { nome, email });
<<<<<<< HEAD
        
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
=======
        alert("Conta criada com sucesso para: " + nome);
        // Aqui você adicionaria a lógica real para enviar para um servidor
>>>>>>> 023b4d86881a61dde324fb25afaefdfac3f00b27
    } else {
        alert("Por favor, preencha todos os campos.");
    }
});