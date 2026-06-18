document.getElementById('registerForm').addEventListener('submit', function(event) {
    // Impede o formulário de ser enviado da maneira padrão (recarregando a página)
    event.preventDefault();

    const nome = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    if (nome && email && senha) {
        console.log("Tentativa de registro para:", { nome, email });
        alert("Conta criada com sucesso para: " + nome);
        // Aqui você adicionaria a lógica real para enviar para um servidor
    } else {
        alert("Por favor, preencha todos os campos.");
    }
});