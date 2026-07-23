require("dotenv").config();

const storageService = require("./services/storage.service");
const bot = require("./bot");
const {startUserBot} = require("./userbot");
const {startHhScanner} = require("./services/hh.scanner");
const {startWebhook, startHealthServer} = require("./webhook");

const USE_WEBHOOK = process.env.USE_WEBHOOK === "true";

(async () => {
    try {
        console.log("Tizim ishga tushmoqda...");
        await storageService.loadConfig();
        console.log("Ma'lumotlar bazasi (Config) yuklandi.");

        if (USE_WEBHOOK) {
            console.log(">>> Webhook rejimida ishga tushilmoqda...");
            await startWebhook();
        } else {
            console.log(">>> Polling rejimida ishga tushilmoqda...");
            await startHealthServer();
            bot.start({
                onStart: (botInfo) => {
                    console.log(`Asosiy boshqaruv boti ishga tushdi! (@${botInfo.username})`);
                }
            });
        }

        try {
            await startUserBot();
        } catch (error) {
            console.warn("User-bot ishga tushmadi, lekin asosiy bot va skaner ishlashda davom etadi.");
        }

        startHhScanner();

        console.log("Monitoring tizimi to‘liq rejimda ishlamoqda");

    } catch (error) {
        console.error("Tizimni ishga tushirishda jiddiy xatolik yuz berdi:", error.message);
        process.exit(1);
    }
})();

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception thrown:", error.message);
});