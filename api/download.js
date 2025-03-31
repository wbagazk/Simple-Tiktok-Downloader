const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
    const { url } = req.query;

    if (!url) {
        res.setHeader('Content-Type', 'application/json');
        return res.status(400).send(JSON.stringify({
            status: 400,
            creator: 'WBK',
            error: 'Masukkan URL TikTok!. Example: /api/download?url=https://www.tiktok.com/@video_hiburan62/video/7486266642637360390?is_from_webapp=1&sender_device=pc'
        }, null, 2));
    }

    try {
        const response = await axios.post(
            'https://snaptikapp.me/wp-json/aio-dl/video-data',
            { url },
            {
                headers: {
                    Accept: '*/*',
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Mobile Safari/537.36'
                },
                timeout: 10000
            }
        );

        const { data } = response;

        if (!data?.medias?.length) {
            return res.status(500).send(JSON.stringify({
                status: 500,
                creator: 'WBK',
                error: 'Gagal mendapatkan link video.'
            }, null, 2));
        }

        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            status: 200,
            creator: 'WBK',
            source: url,
            download_links: data.medias.map(media => ({
                quality: media.quality || 'Unknown',
                format: media.format || 'Unknown',
                url: media.url
            }))
        }, null, 2));
    } catch (err) {
        console.error('Error:', err.message, err.response?.data);
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
            status: 500,
            creator: 'WBK',
            error: 'Terjadi kesalahan, coba lagi nanti!'
        }, null, 2));
    }
});

module.exports = router;
