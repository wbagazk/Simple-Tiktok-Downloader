const express = require('express');
const axios = require('axios');
const router = express.Router();

async function tiktok(url) {
    try {
        function formatNumber(integer) {
            return Number(integer).toLocaleString().replace(/,/g, '.');
        }

        function formatDate(n, locale = 'en') {
            let d = new Date(n * 1000);
            return d.toLocaleDateString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                second: 'numeric'
            });
        }

        let domain = 'https://www.tikwm.com/api/';
        let response = await axios.post(domain, {}, {
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Origin': 'https://www.tikwm.com',
                'Referer': 'https://www.tikwm.com/',
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
                'X-Requested-With': 'XMLHttpRequest'
            },
            params: { url, count: 12, cursor: 0, web: 1, hd: 1 }
        });

        let res = response.data.data;
        if (!res) throw new Error('Invalid response from TikWM API');
        
        let data = res.size ? [
            { type: 'watermark', url: 'https://www.tikwm.com' + res.wmplay },
            { type: 'nowatermark', url: 'https://www.tikwm.com' + res.play },
            { type: 'nowatermark_hd', url: 'https://www.tikwm.com' + res.hdplay }
        ] : res.images.map(v => ({ type: 'photo', url: v }));
        
        return {
            status: true,
            title: res.title || 'No title',
            taken_at: formatDate(res.create_time),
            region: res.region || 'Unknown',
            id: res.id,
            duration: `${res.duration} Seconds`,
            cover: 'https://www.tikwm.com' + res.cover,
            size_wm: res.wm_size,
            size_nowm: res.size,
            size_nowm_hd: res.hd_size,
            data,
            music_info: {
                id: res.music_info?.id || 'N/A',
                title: res.music_info?.title || 'Unknown',
                author: res.music_info?.author || 'Unknown',
                album: res.music_info?.album || null,
                url: 'https://www.tikwm.com' + (res.music || res.music_info?.play || '')
            },
            stats: {
                views: formatNumber(res.play_count || 0),
                likes: formatNumber(res.digg_count || 0),
                comment: formatNumber(res.comment_count || 0),
                share: formatNumber(res.share_count || 0),
                download: formatNumber(res.download_count || 0)
            },
            author: {
                id: res.author?.id || 'Unknown',
                fullname: res.author?.unique_id || 'Unknown',
                nickname: res.author?.nickname || 'Unknown',
                avatar: 'https://www.tikwm.com' + (res.author?.avatar || '')
            }
        };
    } catch (e) {
        throw new Error(`Error fetching TikTok data: ${e.message}`);
    }
}

router.get('/', async (req, res) => {
    const { url } = req.query;
    
    if (!url) {
        return res.status(400).json(JSON.stringify({
            status: 400,
            creator: 'WBK',
            error: 'Masukkan URL TikTok!. Example: /api/download?url=https://www.tiktok.com/@video_hiburan62/video/7486266642637360390'
        }, null, 2));
    }

    try {
        const result = await tiktok(url);
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify({
            status: true,
            code: 200,
            creator: 'WBK',
            result
        }, null, 2));
    } catch (error) {
        res.setHeader('Content-Type', 'application/json');
        res.status(500).send(JSON.stringify({
            status: false,
            code: 500,
            message: error.message
        }, null, 2));
    }
});

module.exports = router;