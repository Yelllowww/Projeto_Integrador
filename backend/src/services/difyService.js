const axios = require('axios');

const DIFY_URL = "https://api.dify.ai/v1/chat-messages";

// Antes essas duas chamadas (com e sem link) estavam copiadas
// dentro de cada rota em routes/ai.routes.js. Agora ficam aqui,
// então se o endpoint do Dify ou o formato do payload mudar,
// só precisa alterar neste arquivo.

async function perguntarSemContexto(pergunta) {
    const payload = {
        inputs: {},
        query: pergunta,
        response_mode: "blocking",
        user: "usuario-vidwise",
    };

    const resp = await axios.post(DIFY_URL, payload, {
        headers: {
            Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
            "Content-Type": "application/json",
        },
    });

    return resp.data;
}

async function perguntarComContexto(pergunta, link, dadosCanal) {
    const payload = {
        inputs: {
            link,
            dados_canal: dadosCanal,
        },
        query: pergunta,
        response_mode: "blocking",
        user: "usuario-vidwise",
    };

    const resp = await axios.post(DIFY_URL, payload, {
        headers: {
            Authorization: `Bearer ${process.env.DIFY_API_KEY}`,
            "Content-Type": "application/json",
        },
    });

    return resp.data;
}

module.exports = { perguntarSemContexto, perguntarComContexto };