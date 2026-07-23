const {Bot, session, Keyboard} = require("grammy");
const channelHandler = require("./handlers/channel.handler");
const keywordHandler = require("./handlers/keyword.handler");

const bot = new Bot(process.env.BOT_TOKEN);
const STARTED = Symbol.for("findjob.bot.started");

global[STARTED] = global[STARTED] || false;
const ADMIN_ID = Number(process.env.ADMIN_ID);
bot.use(session({initial: () => ({step: null})}));

bot.use(async (ctx, next) => {
    if (ctx.from?.id !== ADMIN_ID) {
        return;
    }
    await next();
});

const mainKeyboard = new Keyboard()
    .text("➕ Kanal qo‘shish").text("🗑 Kanal o‘chirish").row()
    .text("➕ Kalit so‘z qo‘shish").text("🗑 Kalit so‘z o‘chirish").row()
    .text("📋 Kanal ro‘yxati").text("🔑 Kalit so‘z ro‘yxati")
    .resized();

bot.command("start", async (ctx) => {
    ctx.session.step = null;
    await ctx.reply(
        "👋 Salom, Monitoring Tizimining boshqaruv paneliga xush kelibsiz!\n\n" +
        "Quyidagi tugmalar orqali kanallar va kalit so‘zlarni dinamik boshqarishingiz mumkin 👇",
        {reply_markup: mainKeyboard}
    );
});

bot.hears("📋 Kanal ro‘yxati", channelHandler.handleListChannels);
bot.hears("➕ Kanal qo‘shish", channelHandler.handleAddChannelStart);
bot.hears("🗑 Kanal o‘chirish", channelHandler.handleRemoveChannelStart);

bot.hears("🔑 Kalit so‘z ro‘yxati", keywordHandler.handleListKeywords);
bot.hears("➕ Kalit so‘z qo‘shish", keywordHandler.handleAddKeywordStart);
bot.hears("🗑 Kalit so‘z o‘chirish", keywordHandler.handleRemoveKeywordStart);
bot.on("message:text", async (ctx) => {
    const text = ctx.message.text.trim();
    const step = ctx.session.step;

    if (!step) return;

    if (step.includes("channel")) {
        await channelHandler.handleChannelText(ctx, text);
    } else if (step.includes("keyword")) {
        await keywordHandler.handleKeywordText(ctx, text);
    }
});

// Webhook middleware
bot.use(session({initial: () => ({})}));

async function startBot(options = {}) {
    if (global[STARTED]) {
        console.warn("Bot allaqachon ishga tushgan, ikkinchi nusxa ishga tushmadi.");
        return;
    }

    global[STARTED] = true;

    try {
        await bot.start(options);
    } catch (error) {
        global[STARTED] = false;
        
        // Telegram 409 xatosi uchun maxsus boshqarish
        if (error?.error_code === 409 || error?.message?.includes("409")) {
            console.error("\n⚠️  Telegram getupdates konflikt:\n");
            console.error("Ushbu xato ehtimol boshqa bot instansiyasi hali ham polling qilayotgani uchun yuz beradi.\n");
            console.error("Yechim:");
            console.error("1. Barcha node proceslarini to'xtating: pkill -9 -f 'node.*src/index'");
            console.error("2. 2-3 soniya kuting (Telegramga eski session timeout bo'lsin)");
            console.error("3. Qayta ishga tushiring: npm start\n");
        }
        
        throw error;
    }

    // Graceful shutdown
    process.on("SIGINT", async () => {
        console.log("\n>>> Bot to'xtatilmoqda...");
        await bot.stop();
        global[STARTED] = false;
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        console.log("\n>>> Bot to'xtatilmoqda...");
        await bot.stop();
        global[STARTED] = false;
        process.exit(0);
    });
}

module.exports = { bot, startBot };