const storageService = require("../../services/storage.service");
async function handleListChannels(ctx) {
    const channels = await storageService.getChannels();
    if (channels.length === 0) {
        return ctx.reply("📭 Hali birorta ham kanal qo‘shilmagan.");
    }

    const list = channels.map((ch, i) => `${i + 1}. ${ch}`).join("\n");
    await ctx.reply(`📋 **Kuzatilayotgan kanallar ro‘yxati:**\n\n${list}`, {parse_mode: "Markdown"});
}
async function handleAddChannelStart(ctx) {
    ctx.session.step = "wait_channel_add";
    await ctx.reply("Qo‘shmoqchi bo‘lgan kanalingiz usernamesini kiriting (masalan: `@ixlosware`):");
}

async function handleRemoveChannelStart(ctx) {
    ctx.session.step = "wait_channel_remove";
    await ctx.reply("Ochirmoqchi bo‘lgan kanalingiz usernamesini kiriting (masalan: `@ixlosware`):");
}

async function handleChannelText(ctx, text) {
    if (!text.startsWith("@")) {
        return ctx.reply("Username majburiy tartibda `@` belgisi bilan boshlanishi kerak!");
    }

    if (ctx.session.step === "wait_channel_add") {
        const added = await storageService.addChannel(text);
        ctx.session.step = null;

        if (added) {
            return ctx.reply(`Kanal muvaffaqiyatli qo‘shildi: ${text}`);
        } else {
            return ctx.reply("Bu kanal allaqachon ro‘yxatda mavjud.");
        }
    }

    if (ctx.session.step === "wait_channel_remove") {
        const removed = await storageService.removeChannel(text);
        ctx.session.step = null;

        if (removed) {
            return ctx.reply(`Kanal ro‘yxatdan o‘chirildi: ${text}`);
        } else {
            return ctx.reply("Bunday kanal ro‘yxatda topilmadi.");
        }
    }
}

module.exports = {
    handleListChannels,
    handleAddChannelStart,
    handleRemoveChannelStart,
    handleChannelText
};