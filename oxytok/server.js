const express = require('express');
const axios = require('axios');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Header sakti biar nggak di-block TikTok
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Mode': 'navigate'
};

app.get('/api/analyze', async (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: 'Mana URL-nya, Boss?' });

    try {
        // Step 1: Ambil HTML mentah dari TikTok
        const response = await axios.get(videoUrl, { headers: HEADERS });
        const html = response.data;

        // Step 2: Extract JSON dari script tag TikTok
        const jsonString = html.split('<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application/json">')[1].split('</script>')[0];
        const rawData = JSON.parse(jsonString);
        
        // Step 3: Mapping data penting (Bypass mode)
        const videoData = rawData.__DEFAULT_SCOPE__['webapp.video-detail'].itemInfo.itemStruct;

        const result = {
            success: true,
            title: videoData.desc,
            author: {
                nickname: videoData.author.nickname,
                uniqueId: videoData.author.uniqueId,
                avatar: videoData.author.avatarLarger
            },
            stats: {
                views: videoData.stats.playCount,
                likes: videoData.stats.diggCount,
                comments: videoData.stats.commentCount,
                shares: videoData.stats.shareCount
            },
            music: videoData.music.title,
            cover: videoData.video.cover
        };

        res.json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Gagal tembus, TikTok lagi ketat atau URL salah.' });
    }
});

app.listen(PORT, () => console.log(`[OXYTOK] Running on port ${PORT}`));