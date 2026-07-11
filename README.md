# 📢 Telegram Channels Keywords Monitor Bot

Telegram kanallarini **real vaqt rejimida** monitoringa olish va kalit so'zlar topilganda ularni avtomatik ravishda
output kanalingizga yo'naltiruvchi **Open Source** loyiha. **Async/await**, **grammY** va **GramJS** frameworklari bilan
yozilgan.

---

## ✨ Asosiy Imkoniyatlari

✅ **Web UI Bilan Admin Panel** – Kodga tegmasdan, Telegram Bot orqali kalit so'zlar va kanallarni qo'shish/o'chirish  
✅ **Real-time Monitoring** – 30 soniyada bir marta kanallarni sknerlash  
✅ **Parallel Ishlash** – Admin bot + Skanerlovchi User-bot bitta dastur ichida  
✅ **Xavfsizlik** – Faqat siz (Admin ID) botni boshqarasiz  
✅ **Yaddosh Optimizatsiyasi** – Qayta ishga tushganda spam bo'lmaydi  
✅ **Asinxron Arxitektura** – Non-blocking I/O, Node.js event loop bloklanmaydi

---

## 📦 Ishga Tushirishdagi 3 Qadam

### 1️⃣ O'rnatish (30 soniya)

```bash
# Loyihani yuklab oling
git clone https://github.com/mrebbar/telegram-monitor.git
cd telegram-monitor

# Paketlarni o'rnatish
npm install
```

### 2️⃣ Konfiguratsiya (.env sozlash)

Ildiz papkasida `.env` faylini yarating va to'ldiring:

```env
# https://my.telegram.org saytidan olinadi
API_ID=12345678
API_HASH=xxxxxxxxxxxxxxxxxxxxxxxxxx

# GramJS Session kaliti (birinchi run'da generate bo'ladi)
SESSION=1BVtsZ7_AAAA...

# @BotFather dan olingan Token
# https://t.me/botfather -> /start -> /newbot
BOT_TOKEN=123456789:ABCdefGHIjklmnoPQRstuVWXyz

# Sizning Telegram ID (https://t.me/username_to_id_bot)
ADMIN_ID=1234567890

# Kalit so'z topilganda forward bo'ladigan kanal
# Masalan: @my_monitoring_channel
OUTPUT_CHANNEL=-1001234567890
```

**Token va keylarni qayerdan olish?**

| Parametr             | Qayerdan olish                                         | Qo'llanma                                 |
|----------------------|--------------------------------------------------------|-------------------------------------------|
| `API_ID`, `API_HASH` | [my.telegram.org](https://my.telegram.org)             | Settings → API development tools          |
| `BOT_TOKEN`          | [@BotFather](https://t.me/botfather)                   | /start → /newbot → token nusxalash        |
| `ADMIN_ID`           | [@username_to_id_bot](https://t.me/username_to_id_bot) | Botga /start yuboring                     |
| `SESSION`            | Avtomatik generate                                     | Birinchi run'da terminal'da izoh beriladi |

### 3️⃣ Ishga Tushirish

```bash
# Development rejimi (live reload bilan)
npm run dev

# Production rejimi
npm start
```

**Bunga qadam!** Terminal'da "Bot started ✓" xabarini ko'rsangiz, hamma tayyor.

---

## 🤖 Botdan Foydalanish (Qadamma-Qadam)

### Boshlash

Telegram'da botingizga `/start` yuboring. Menyu paydo bo'ladi:

```
🎯 ADMIN PANEL MENU
━━━━━━━━━━━━━━━━━
📺 Kanallarni Boshqarish
  ➕ Kanal Qo'shish
  🗑️  Kanal O'chirish
  📋 Kanal Ro'yxati

🔑 Kalit So'zlarni Boshqarish
  ➕ Kalit So'z Qo'shish
  🗑️  Kalit So'z O'chirish
  🔑 Kalit So'z Ro'yxati

ℹ️  Malumot
  📊 Status
```

### Qo'llanma

#### 1. Kanal Qo'shish

```
👤 Siz: ➕ Kanal Qo'shish
🤖 Bot: Kanal username'ini kiriting (@ bilan yoki bilan):

👤 Siz: @nodejs_uz
🤖 Bot: ✅ Kanal muvaffaqiyatli qo'shildi!
```

**Muhim:** Kanal **public** bo'lishi va bot unga **murojaat qilish huquqiga** ega bo'lishi kerak.

#### 2. Kalit So'z Qo'shish

```
👤 Siz: ➕ Kalit So'z Qo'shish
🤖 Bot: Qaysi so'zni kuzatishni xohlaysiz?

👤 Siz: Senior Developer
🤖 Bot: ✅ "Senior Developer" kuzatilmoqda!

Endi har safar bu so'z topilganda, xabar OUTPUT_CHANNEL ga yuboriladi.
```

#### 3. Status Ko'rish

```
👤 Siz: 📊 Status
🤖 Bot:
📺 Kanallar: 5 ta
   • @nodejs_uz
   • @python_uz
   • @jobs_tashkent
   • @webdev_uz
   • @startup_uz

🔑 Kalit So'zlar: 3 ta
   • Senior Developer
   • Remote Job
   • $3000+
```

---

## 📂 Loyiha Tuzilishi

```
telegram-monitor/
│
├── 📄 README.md                    ← Siz buni o'qiyapсiz!
├── 📄 package.json                 ← Paketlar ro'yxati
├── 🔒 .env                         ← Maxfiy tokenlar (gitignore'da!)
├── 📋 config.json                  ← Saqlangan kanallar & so'zlar
│
└── 📁 src/
    │
    ├── 🤖 bot/                     ← ADMIN PANEL BOT (grammY)
    │   ├── handlers/
    │   │   ├── channels.js         ← Kanal qo'shish/o'chirish
    │   │   ├── keywords.js         ← Kalit so'z qo'shish/o'chirish
    │   │   └── utils.js            ← Yordamchi funksiyalar
    │   └── index.js                ← Bot yaratish va middleware
    │
    ├── 👥 userbot/                 ← SKANERLASHCHI USER-BOT (GramJS)
    │   ├── scanner.js              ← 30 soniyada sknerlash logikasi
    │   └── index.js                ← Ulanish va boshlash
    │
    ├── 🛠️  services/               ← UTILITY XIZMATLAR
    │   ├── storage.service.js      ← config.json bilan ishlash (async)
    │   ├── logger.service.js       ← Xatoliklar va loglar
    │   └── telegram.service.js     ← Telegram API chaqiruvlari
    │
    └── ⚙️  index.js                ← MAIN ENTRY POINT
```

---

## 🔧 Texnik Tafsilotlar

### Nima uchun GramJS + grammY?

| Texnologiya | Maqsadi              | Sabab                                            |
|-------------|----------------------|--------------------------------------------------|
| **GramJS**  | Kanallarni sknerlash | Real user sifatida kirish mumkin (limitlar yo'q) |
| **grammY**  | Admin paneli boti    | Oson, tez, yaxshi dokumentatsiyasi               |

### Ishlash Jarayoni

```
⏱️  Bot ishga tushadi
│
├─ 🤖 Admin Panel (doimiy eshitadyapti)
│  │ Siz: ➕ Kanal Qo'shish
│  └─ Bot: ✅ Qo'shildi, config.json'ga saqlandi
│
└─ 👥 Skanerlovchi (har 30 soniyada)
   │ Saqlangan kanallarni o'qiydi
   │ Kalit so'zlarni qidiradi
   │ Topilganda OUTPUT_CHANNEL'ga forward qiladi
   └─ (Spam bo'lmaslik uchun lastMessageIds saqlaydi)
```

### Xavfsizlik

- ✅ Faqat siz (`ADMIN_ID`) botga murojaat qila olasiz
- ✅ `.env` faylida maxfiy tokenlar (Git'ga yuklam!)
- ✅ Qayta ishga tushganda eski xabarlar qayta yo'naltrilmaydi

---

## 🐛 Xatoliklar va Yechim

### Masala: "Cannot read property 'id' of undefined"

**Sabab:** Bot kanal ichiga kira olmadi  
**Yechim:**

```bash
# Kanal ID'sini tekshiring
# Kanal PUBLIC va ACCESSIBLE bo'lishi kerak
# Bot @admin qilgan kanal bo'lsa, qo'shni
```

### Masala: ".env file not found"

**Sabab:** `.env` fayli yo'q  
**Yechim:**

```bash
# .env faylini yarating va to'ldiring (yuqorida tafsilot)
cp .env.example .env  # agar bo'lsa
nano .env             # tekshiring
```

### Masala: "Bot token is invalid"

**Sabab:** Token noto'g'ri yoki yanasiga bo'ldi  
**Yechim:**

```bash
# @BotFather'da /start yuboring
# Botingiz nomini tanlang
# Yangi token oling va .env'ga kiriting
```

### Masala: Session keyi expired

**Sabab:** SESSION kaliti eski bo'ldi  
**Yechim:**

```bash
# .env'dan SESSION qatorini o'chiring
# Bot qayta ishga tushganda yangi session oling
npm start
# Telegramdan tasdiqlang
```

---

## 📊 Performance & Limits

| Parametr                 | Qiymati    | Tafsilot                                    |
|--------------------------|------------|---------------------------------------------|
| **Sknerlash intervali**  | 30 soniya  | Bir kanal bir xabardan ko'p tahlil qilmaydi |
| **Max kanallar**         | Cheksiz    | Lekin har biri bir HTTP request             |
| **Max kalit so'zlar**    | Cheksiz    | Regex'ta saqlanadi                          |
| **Config fayl o'lchami** | < 5 MB     | Asinxron o'qiladi                           |
| **Ram iste'mol**         | ~50-100 MB | Minimal                                     |

---

## 🚀 Production'ga Chiqarish

### Option 1: VPS'da (Recommended)

```bash
# 1. Server'ga ulanish
ssh root@your_server_ip

# 2. Node.js o'rnatish
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 3. Loyihani yuklab olish
cd /opt
git clone https://github.com/mrebbar/telegram-monitor.git
cd telegram-monitor
npm install

# 4. .env sozlash
nano .env
# Barcha parametrlarni to'ldiring

# 5. PM2 bilan doimiy ishga tushirish
npm install -g pm2
pm2 start src/index.js --name "telegram-monitor"
pm2 startup
pm2 save
```

### Option 2: Docker'da

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

CMD ["npm", "start"]
```

```bash
docker build -t telegram-monitor .
docker run -d \
  --name monitor \
  --env-file .env \
  telegram-monitor
```

### Option 3: GitHub Actions (Avtomatik Deploy)

Qo'shimcha faylga qo'ring `.github/workflows/deploy.yml`

---

## 📚 Qo'shimcha Resurslar

- 📖 [GramJS Dokumentatsiyasi](https://gram.js.org/)
- 📖 [grammY Framework](https://grammy.dev/)
- 📖 [Telegram Bot API](https://core.telegram.org/bots/api)
- 💬 [Node.js Community](https://nodejs.org/en/community/)

---

## 🤝 Hissa Qo'shish (Contributing)

Loyihani yaxshilashga yordam bering!

```bash
# 1. Repositoryni fork qiling
# 2. Feature branch yarating
git checkout -b feature/amazing-feature

# 3. O'zgartirishlarni commit qiling
git commit -m "Add amazing feature"

# 4. Branch'ga push qiling
git push origin feature/amazing-feature

# 5. Pull Request oching
# GitHub'da "Compare & pull request" tugmasini bosing
```

### Qoida:

- ✅ Kod clean va readable bo'lsin
- ✅ Comments qo'shing (Uzbek yoki English)
- ✅ Test qiling (agar bo'lsa)
- ✅ Commit message'lari aniq bo'lsin



## 📞 Aloqa va Savolllar

| Kanal                  | Link                                 |
|------------------------|--------------------------------------|
|
| 
| **Telegram**           | [@mrebbar01](https://t.me/mrebbar01) |
| **Email**              | mrebbar01@gmail.com                       |

---

## 🎯 Roadmap (Kelajakda)

- [ ] Web Dashboard (React'da)
- [ ] Statistics & Analytics
- [ ] Webhook integratsiyasi
- [ ] Telegram Channels API (user-bot o'rniga)
- [ ] Multi-language support
- [ ] Telegram Premium kanallar uchun support
- [ ] Advanced filtering (regex, date range, etc.)
- [ ] Database integration (PostgreSQL)

---

## ⭐ Agar loyiha yoqsa, star bering!

```
            ⭐
          ⭐⭐⭐
         ⭐⭐⭐⭐⭐
        ⭐⭐⭐⭐⭐⭐⭐
      ⭐⭐⭐⭐⭐⭐⭐⭐⭐
     ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐

🙏 Rahmat ko'rsatganingiz uchun!
```


**Tahrir**: 2026 
**Status:** 🟢 Aktiv Development