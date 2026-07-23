const {TelegramClient} = require("telegram");
const {StringSession} = require("telegram/sessions");
const storageService = require("../services/storage.service");

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION);
const outputChannel = process.env.OUTPUT_CHANNEL;
const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

async function checkChannels() {
    const channels = await storageService.getChannels();
    const keywords = await storageService.getKeywords();
    if (channels.length === 0 || keywords.length === 0) {
        return;
    }

    for (const channel of channels) {
        try {
            const messages = await client.getMessages(channel, {limit: 5});
            const lastSavedId = await storageService.getLastMessageId(channel);
            let currentMaxId = lastSavedId;

            for (const msg of messages) {
                if (!msg.message) continue;
                if (lastSavedId && msg.id <= lastSavedId) {
                    continue;
                }
                for (const word of keywords) {
                    if (msg.message.toLowerCase().includes(word.toLowerCase())) {
                        console.log(`>>> 📢 ${channel} kanalida kalit so'z topildi: "${word}"`);

                        const formatted = `📢 **Kalit so‘z topildi!**\n\n` +
                            `🔑 So‘z: **${word}**\n` +
                            `📌 Kanal: ${channel}\n\n` +
                            `📝 Xabar:\n${msg.message}`;
                        await client.sendMessage(outputChannel, {
                            message: formatted,
                            parseMode: "markdown",
                            linkPreview: false
                        });
                        break;
                    }
                }

                if (msg.id > currentMaxId) {
                    currentMaxId = msg.id;
                }
            }
            if (currentMaxId > lastSavedId) {
                await storageService.setLastMessageId(channel, currentMaxId);
            }

        } catch (err) {
            console.error(`Skanerlashda xatolik (${channel}):`, err.message);
        }
    }
}

async function startUserBot() {
    console.log("User-bot ulanmoqda...");

    try {
        await client.start();
        const isAuthorized = await client.isUserAuthorized();
        if (!isAuthorized) {
            throw new Error("Telegram sessiyasi avtorizatsiyadan o'tmagan. Iltimos yeni SESSION yarating.");
        }

        console.log("User-bot muvaffaqiyatli ulandi!");
        setInterval(checkChannels, 30 * 1000);
    } catch (error) {
        const message = error?.message || String(error);

        if (message.includes("AUTH_KEY_DUPLICATED") || message.includes("406")) {
            console.error("Telegram sessiyasi duplikat bo'lib qoldi yoki eskirgan. Iltimos yangi SESSION yarating:");
            console.error("1) node generate-session.js");
            console.error("2) yangi SESSION qiymatini .env faylga joylang");
        } else {
            console.error("User-botni ishga tushirishda xatolik:", message);
        }

        throw error;
    }
}

module.exports = {startUserBot};