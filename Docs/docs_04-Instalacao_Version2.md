# 4. Guia de Instalação (Para Desenvolvedores)

Siga os passos abaixo para configurar o ambiente de desenvolvimento e executar o projeto em sua máquina local.

### Pré-requisitos

-   [Node.js](https://nodejs.org/) (versão 18 ou superior).
-   Uma conta no [Apify](https://apify.com/) e sua chave de API.
-   Uma conta no [Dify](https://dify.ai/) e a chave de API da sua aplicação de LLM.
-   Um editor de código, como [Visual Studio Code](https://code.visualstudio.com/).

### 1. Clone o Repositório

```bash
git clone https://github.com/Yelllowww/Projeto_Integrador.git
cd Projeto_Integrador
```

### 2. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto. Este arquivo guardará suas chaves de API e outras configurações sensíveis. Copie o conteúdo de `.env.example` (se houver) ou crie um novo com a seguinte estrutura:

```
# .env

# Chave de API da sua aplicação no Dify
DIFY_API_KEY="sua-chave-aqui"

# ID do seu "Actor" no Apify e sua chave de API do Apify
APIFY_ACTOR_ID="seu-actor-id-aqui"
APIFY_API_TOKEN="seu-token-aqui"
```

**Importante**: Substitua `"sua-chave-aqui"` e outros valores pelos suas credenciais reais. Não comite o arquivo `.env` no Git.

### 3. Instale as Dependências

Se o projeto tiver dependências de JavaScript (o que é provável), instale-as com um gerenciador de pacotes.

```bash
npm install
```

### 4. Execute o Projeto

Para iniciar a aplicação em modo de desenvolvimento, execute:

```bash
npm start
```
Isso deve iniciar um servidor local (geralmente em `http://localhost:3000` ou similar). Abra este endereço no seu navegador para ver a aplicação funcionando.

---

*Espaço para uma imagem do terminal mostrando o projeto sendo executado com sucesso.*

![Placeholder do Terminal](https://via.placeholder.com/700x250.png?text=Terminal+com+o+comando+'npm+start'+bem-sucedido)