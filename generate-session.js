const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const readline = require("readline");
require("dotenv").config();

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(""); // Empty string for new session

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (text) => new Promise((resolve) => rl.question(text, resolve));

(async () => {
  console.log("Telegram Session Generator ishga tushdi...");
  
  if (!apiId || !apiHash) {
    console.error("Xatolik: .env faylida API_ID yoki API_HASH kiritilmagan!");
    process.exit(1);
  }

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await question("Telefon raqamingizni kiriting (+998...): "),
    password: async () => await question("2-bosqichli parol (agar bo'lsa): "),
    phoneCode: async () => await question("Telegramdan kelgan tasdiqlash kodini kiriting: "),
    onError: (err) => console.log("Xatolik:", err),
  });

  console.log("\n✅ Muvaffaqiyatli tizimga kirdingiz!");
  const sessionString = client.session.save();
  
  console.log("\n=======================================================");
  console.log("Sizning SESSION kalitingiz (buni kimgadir bermang!):");
  console.log(sessionString);
  console.log("=======================================================\n");
  
  console.log("☝️ Ushbu matnni nusxalab, .env faylidagi SESSION= qatoriga qo'ying.");
  
  await client.disconnect();
  rl.close();
  process.exit(0);
})();
