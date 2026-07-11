const storageService = require("./storage.service");
const bot = require("../bot");
const { XMLParser } = require("fast-xml-parser");

const outputChannel = process.env.OUTPUT_CHANNEL;
const parser = new XMLParser();

async function checkHhVacancies() {
    try {
        const keywords = await storageService.getKeywords();
        if (keywords.length === 0) return;

        // Barcha kalit so'zlarni bitta so'rovga birlashtiramiz
        const searchQuery = keywords.join(" OR ");
        const url = `https://hh.uz/search/vacancy/rss?text=${encodeURIComponent(searchQuery)}&area=97`;

        const response = await fetch(url);
        if (!response.ok) {
            console.error("HH.uz bilan bog'lanishda xatolik:", response.statusText);
            return;
        }

        const xmlData = await response.text();
        const jsonObj = parser.parse(xmlData);

        let items = jsonObj?.rss?.channel?.item;
        if (!items) return;
        
        // Agar bitta element bo'lsa obyekt bo'ladi, biz uni doim massiv sifatida ishlashini ta'minlaymiz
        if (!Array.isArray(items)) {
            items = [items];
        }

        for (const item of items) {
            const link = item.link;
            const match = link.match(/vacancy\/(\d+)/);
            if (!match) continue;
            
            const vacancyId = match[1];

            const isScanned = await storageService.isHhIdScanned(vacancyId);
            if (isScanned) continue;

            const title = item.title || "";
            const description = item.description || "";
            
            let matchedKeyword = null;
            for (const word of keywords) {
                if (title.toLowerCase().includes(word.toLowerCase()) || description.toLowerCase().includes(word.toLowerCase())) {
                    matchedKeyword = word;
                    break;
                }
            }

            if (matchedKeyword) {
                console.log(`>>> 💼 HH.uz da yangi vakansiya: "${matchedKeyword}" - ${title}`);

                let company = "Noma'lum";
                let region = "Noma'lum";
                let salary = "Ko'rsatilmagan";

                const companyMatch = description.match(/Компания:\s*([^<]+)/i) || description.match(/Вакансия компании:\s*([^<]+)/i);
                if (companyMatch) company = companyMatch[1].trim();

                const regionMatch = description.match(/Регион:\s*([^<]+)/i);
                if (regionMatch) region = regionMatch[1].trim();

                const salaryMatch = description.match(/Предполагаемый уровень месячного дохода:\s*([^<]+)/i);
                if (salaryMatch) salary = salaryMatch[1].trim();

                const formatted = `💼 **Yangi Vakansiya (HH.uz)!**\n\n` +
                    `🔑 Kalit so‘z: **${matchedKeyword}**\n` +
                    `📌 Lavozim: **${title}**\n` +
                    `🏢 Kompaniya: ${company}\n` +
                    `📍 Hudud: ${region}\n` +
                    `💰 Oylik: ${salary}\n\n` +
                    `🔗 [Vakansiyani ko'rish](${link})`;

                try {
                    await bot.api.sendMessage(outputChannel, formatted, { 
                        parse_mode: "Markdown", 
                        link_preview_options: { is_disabled: true } 
                    });
                } catch (sendErr) {
                    console.error("HH.uz xabarini yuborishda xatolik:", sendErr.message);
                }
            }

            // Xabar jo'natilsa ham, jo'natilmasa ham uni ko'rilgan deb belgilaymiz (qayta-qayta tekshirmaslik uchun)
            await storageService.saveScannedHhId(vacancyId);
        }

    } catch (err) {
        console.error("HH.uz skanerlashda xatolik:", err.message);
    }
}

function startHhScanner() {
    console.log("HH.uz skaneri ishga tushmoqda...");
    // Har 2 daqiqada tekshiradi
    setInterval(checkHhVacancies, 2 * 60 * 1000);
    // Dastlabki ishga tushishi:
    checkHhVacancies();
}

module.exports = { startHhScanner };
