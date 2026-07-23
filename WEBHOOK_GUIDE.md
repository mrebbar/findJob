# Webhook Rejimiga O'tish Qo'llanmasi

## Polling vs Webhook

### Polling (Hozirgi rejim)
- Bot har 30 soniyada Telegram serveriga so'rov yuboradi
- Har doim aktiv server kerak
- Cloud Run-da doimiy pul sarflaydi

### Webhook (Tavsiya qilinadigan)
- Xabar kelganda Telegram server sizning bot serveriga xabar yuboradi
- Faqat xabar kelganda aktivdir
- Cloud Run-da kichik xarajat

---

## Webhook Setup Qadamlari

### 1. Domenni tayyorlash
- HTTPS domeininiz bo'lishi kerak (masalan: `https://yourdomain.com`)
- Cloud Run, Heroku, yoki boshqa cloud platform ishlatishingiz mumkin

### 2. .env faylni yangilash
```env
USE_WEBHOOK=true
PORT=8000
WEBHOOK_URL=https://yourdomain.com
WEBHOOK_SECRET=your-secret-key-123
```

### 3. Lokal testda polling rejimini ishlatish
```env
USE_WEBHOOK=false
```

### 4. Cloud Run-da deploy qilish
```bash
# Cloud Run-ga push qilish
gcloud run deploy your-bot-name \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --update-env-vars USE_WEBHOOK=true,WEBHOOK_URL=https://your-cloud-run-url.run.app,WEBHOOK_SECRET=your-secret
```

### 5. Bot API konfiguratsiyasi
Webhook URL avtomatik o'rnatiladi telegram API-ga, lekin siz ham qo'lda tekshirishingiz mumkin:

```bash
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

---

## Cloud Run Deployment

### Dockerfile yaratish (masalan):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]
```

### .dockerignore:
```
node_modules
.git
.env
config.json
```

### Deploy:
```bash
gcloud run deploy telegram-bot \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8000 \
  --update-env-vars USE_WEBHOOK=true,WEBHOOK_URL=https://YOUR_CLOUD_RUN_URL,WEBHOOK_SECRET=YOUR_SECRET
```

---

## Xavfsizlik

- `WEBHOOK_SECRET` kuchli va tasodifiy bo'lsin
- HTTPS zarur (HTTP mumkin emas)
- Webhook URL rahasia qo'lda kimga ham aytmang

---

## Tez O'tish

1. Lokal testda: `USE_WEBHOOK=false` qo'yin (Polling)
2. Production-da: `USE_WEBHOOK=true` qo'yin (Webhook)
3. WEBHOOK_URL o'ng joylashtirilganligini tekshiring
4. Bot testlash: xabar yuboring va javob olishni tekshiring

---

## Polling-dan Webhook-ga O'tish

- Kod bilan bir xil ishlaydi
- Faqat .env faylni o'zgartiring
- Qayta restart qilish yetarli
