require("dotenv").config();

const storageService = require("./services/storage.service");
const bot = require("./bot");
const {startUserBot} = require("./userbot");
const {startHhScanner} = require("./services/hh.scanner");
const {startWebhook} = require("./webhook");

const USE_WEBHOOK = process.env.USE_WEBHOOK === "true";

(async () => {
    try {
        console.log("Tizim ishga tushmoqda...");
        await storageService.loadConfig();
        console.log("Ma'lumotlar bazasi (Config) yuklandi.");

        if (USE_WEBHOOK) {
            // Webhook rejimi
            console.log(">>> Webhook rejimida ishga tushilmoqda...");
            await startWebhook();
        } else {
            // Polling rejimi (default)
            console.log(">>> Polling rejimida ishga tushilmoqda...");
            bot.start({
                onStart: (botInfo) => {
                    console.log(`Asosiy boshqaruv boti ishga tushdi! (@${botInfo.username})`);
                }
            });
        }

        await startUserBot();
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