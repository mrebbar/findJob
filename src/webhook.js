const http = require("http");
const bot = require("./bot");

const PORT = process.env.PORT || 8000;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // https://yourdomain.com
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "secret-key";

async function startWebhook() {
    try {
        // Webhook URL ni o'rnatish
        const secretPath = `/bot${WEBHOOK_SECRET}`;
        const fullWebhookUrl = `${WEBHOOK_URL}${secretPath}`;

        console.log(`>>> Webhook URL: ${fullWebhookUrl}`);

        // Telegram ga webhook URL ni aytish
        await bot.api.setWebhook(fullWebhookUrl);
        console.log(">>> Webhook Telegramda ro'yxatga olingan!");

        // HTTP server yaratish
        const server = http.createServer(async (req, res) => {
            // Faqat POST va to'g'ri path dan keladigan so'rovlarni qabul qil
            if (req.method === "POST" && req.url === secretPath) {
                let body = "";

                req.on("data", (chunk) => {
                    body += chunk.toString();
                });

                req.on("end", async () => {
                    try {
                        const update = JSON.parse(body);
                        // Bot update ni qayta ishlash
                        await bot.handleUpdate(update);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ ok: true }));
                    } catch (error) {
                        console.error("Webhook xatosi:", error);
                        res.writeHead(500, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ ok: false, error: error.message }));
                    }
                });
            } else {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ ok: false }));
            }
        });

        server.listen(PORT, () => {
            console.log(`>>> Server portda ishlamoqda: ${PORT}`);
            console.log(">>> Webhook rejimida bot ishga tushdi!");
        });

        // Graceful shutdown
        process.on("SIGTERM", async () => {
            console.log(">>> SIGTERM qabul qilindi, to'xtatilmoqda...");
            server.close();
            await bot.api.deleteWebhook();
            process.exit(0);
        });

        return server;
    } catch (error) {
        console.error("Webhook sozlashda xatolik:", error.message);
        throw error;
    }
}

module.exports = { startWebhook };
