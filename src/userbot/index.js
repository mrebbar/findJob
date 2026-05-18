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
    await client.connect();
    console.log("User-bot muvaffaqiyatli ulandi!");
    setInterval(checkChannels, 30 * 1000);
}

module.exports = {startUserBot};