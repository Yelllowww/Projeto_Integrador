# 2. Arquitetura e Tecnologias

A aplicação é construída sobre uma arquitetura moderna que integra serviços de frontend, web scraping e inteligência artificial para entregar uma experiência fluida e poderosa.

### Diagrama da Arquitetura

Abaixo, um diagrama simplificado ilustra o fluxo de dados e a interação entre os componentes do sistema.

![Placeholder para Diagrama de Arquitetura](https://via.placeholder.com/800x450.png?text=Frontend+->+Apify+->+Dify+->+Frontend)

### Componentes Principais

1.  **Frontend (Cliente)**
    -   **Tecnologias**: HTML5, CSS3, JavaScript (ES6+).
    -   **Descrição**: É a interface com a qual o usuário interage. Construída para ser intuitiva, responsiva e amigável. É responsável por coletar a URL do perfil do usuário, enviar requisições para os serviços de backend (neste caso, as APIs do Apify e Dify) e exibir os resultados, incluindo os gráficos e as respostas da IA.

2.  **Serviço de Web Scraping (Apify)**
    -   **Tecnologia**: [Apify](https://apify.com/)
    -   **Descrição**: Utilizamos um "Actor" do Apify para realizar a extração de dados do perfil de rede social fornecido. O Actor é configurado para navegar na página e coletar informações relevantes, como:
        -   Textos das últimas postagens.
        -   Métricas de engajamento (curtidas, comentários).
        -   Formatos de conteúdo (imagem, vídeo, texto).
    -   O resultado é uma estrutura de dados (JSON) que é enviada para o próximo estágio.

3.  **Serviço de Inteligência Artificial (Dify)**
    -   **Tecnologia**: [Dify](https://dify.ai/)
    -   **Descrição**: Dify serve como a plataforma para construir e operar nossa aplicação de LLM. Criamos um fluxo de trabalho (workflow) no Dify que recebe os dados extraídos pelo Apify como contexto. O prompt enviado ao modelo de linguagem instrui a IA a:
        -   Analisar os dados e identificar padrões.
        -   Gerar insights sobre o desempenho do perfil.
        -   Sugerir novos tópicos, formatos e horários para postagens.
        -   Criar rascunhos de conteúdo com base no estilo do usuário.
    -   A API do Dify expõe esse workflow, permitindo que nosso frontend o chame e receba as respostas geradas.