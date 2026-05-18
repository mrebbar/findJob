const storageService = require("../../services/storage.service");

async function handleListKeywords(ctx) {
    const keywords = await storageService.getKeywords();
    if (keywords.length === 0) {
        return ctx.reply("Hali birorta ham kalit so‘z qo‘shilmagan.");
    }

    const list = keywords.map((kw, i) => `${i + 1}. \`${kw}\``).join("\n");
    await ctx.reply(`**Kuzatilayotgan kalit so‘zlar ro‘yxati:**\n\n${list}`, {parse_mode: "Markdown"});
}

async function handleAddKeywordStart(ctx) {
    ctx.session.step = "wait_keyword_add";
    await ctx.reply("Yangi kalit so‘z yoki iborani kiriting:");
}

async function handleRemoveKeywordStart(ctx) {
    ctx.session.step = "wait_keyword_remove";
    await ctx.reply("❌ O‘chirmoqchi bo‘lgan kalit so‘zingizni kiriting:");
}
async function handleKeywordText(ctx, text) {
    if (ctx.session.step === "wait_keyword_add") {
        const added = await storageService.addKeyword(text);
        ctx.session.step = null;

        if (added) {
            return ctx.reply(`Kalit so‘z muvaffaqiyatli qo‘shildi: \`${text}\``, {parse_mode: "Markdown"});
        } else {
            return ctx.reply("Bu kalit so‘z allaqachon ro‘yxatda mavjud.");
        }
    }

    if (ctx.session.step === "wait_keyword_remove") {
        const removed = await storageService.removeKeyword(text);
        ctx.session.step = null;

        if (removed) {
            return ctx.reply(`Kalit so‘z ro‘yxatdan o‘chirildi: \`${text}\``, {parse_mode: "Markdown"});
        } else {
            return ctx.reply("Bunday kalit so‘z ro‘yxatda topilmadi.");
        }
    }
}

module.exports = {
    handleListKeywords,
    handleAddKeywordStart,
    handleRemoveKeywordStart,
    handleKeywordText
};