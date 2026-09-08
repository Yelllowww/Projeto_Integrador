const { ApifyClient } = require('apify');

// Antes essa lógica (chamar o ator do Apify e extrair canal + vídeos)
// estava toda dentro da rota /youtube no server.js. Isolar aqui deixa
// a rota só orquestrando: chama isso, salva no banco, responde.
async function rasparCanalYoutube(url) {
    const apifyClient = new ApifyClient({ token: process.env.APIFY_TOKEN });

    const run = await apifyClient
        .actor("streamers/youtube-channel-scraper")
        .call({ startUrls: [{ url }], maxResults: 50 });

    const { items = [] } = await apifyClient
        .dataset(run.defaultDatasetId)
        .listItems();

    const videoItems = items.filter(
        (i) => i.type === "video" || i.itemType === "video" || (i.title && i.type !== "channel")
    );
    const about = items.find((i) => i.type === "channel") || videoItems[0]?.aboutChannelInfo || {};

    const channelInfo = {
        title: about.channelName || about.title || "Canal",
        description: about.channelDescription || about.description || "",
        avatarUrl: about.channelAvatarUrl || about.avatar || "",
        subscribers: about.numberOfSubscribers ?? about.subscribers ?? 0,
        channelTotalViews: about.channelTotalViews ?? about.totalViews ?? 0,
    };

    const videoData = videoItems.map((v) => ({
        title: v.title || v.videoTitle || "Sem título",
        viewCount: v.viewCount ?? v.views ?? 0,
        duration: v.duration || v.videoDuration || "-",
        date: v.date || v.uploadDate || v.publishedAt || "-",
    }));

    return { channelInfo, videoData };
}

module.exports = { rasparCanalYoutube };