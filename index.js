const express = require("express");
const cors = require("cors");
const path = require("path");
const rateLimit = require("express-rate-limit");

const app = express();

let totalRequests = 0;
let clients = [];

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 25,
    message: { error: "Terlalu banyak permintaan, coba 60 detik lagi." },
    keyGenerator: (req) => {
        return req.headers["x-forwarded-for"]?.split(",")[0] || req.ip;
    },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    totalRequests++;
    sendUpdateToClients();
    next();
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.use(`/api/ttdl`, limiter, require(`./api/ttdl`));

module.exports = app;