const http = require("http");
const bot = require("./bot");

const PORT = Number(process.env.PORT || 8080);
const WEBHOOK_URL = process.env.WEBHOOK_URL; // https://yourdomain.com
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "secret-key";

function createServer({ useWebhook = false } = {}) {
    const secretPath = `/bot${WEBHOOK_SECRET}`;

    const server = http.createServer(async (req, res) => {
        if (req.method === "GET" && (req.url === "/healthz" || req.url === "/")) {
            res.writeHead(200, { "Content-Type": "text/plain" });
            res.end("ok");
            return;
        }

        if (useWebhook && req.method === "POST" && req.url === secretPath) {
            let body = "";

            req.on("data", (chunk) => {
                body += chunk.toString();
            });

            req.on("end", async () => {
                try {
                    const update = JSON.parse(body);
                    await bot.handleUpdate(update);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ ok: true }));
                } catch (error) {
                    console.error("Webhook xatosi:", error);
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ ok: false, error: error.message }));
                }
            });
            return;
        }

        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false }));
    });

    return new Promise((resolve, reject) => {
        server.listen(PORT, "0.0.0.0", () => {
            console.log(`>>> Server portda ishlamoqda: ${PORT}`);
            resolve(server);
        });
        server.on("error", reject);
    });
}

async function startHealthServer() {
    return createServer({ useWebhook: false });
}

async function startWebhook() {
    try {
        const secretPath = `/bot${WEBHOOK_SECRET}`;
        const fullWebhookUrl = `${WEBHOOK_URL}${secretPath}`;

        if (!WEBHOOK_URL) {
            throw new Error("WEBHOOK_URL muhit o'zgaruvchisi kerak");
        }

        console.log(`>>> Webhook URL: ${fullWebhookUrl}`);
        await bot.api.setWebhook(fullWebhookUrl);
        console.log(">>> Webhook Telegramda ro'yxatga olingan!");

        const server = await createServer({ useWebhook: true });

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

module.exports = { startWebhook, startHealthServer };
