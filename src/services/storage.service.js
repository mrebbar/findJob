const fs = require("fs").promises;
const path = require("path");

const configPath = path.join(__dirname, "../..", "config.json");

class StorageService {
    constructor() {
        this.config = null;
    }
    async loadConfig() {
        try {
            const data = await fs.readFile(configPath, "utf8");
            this.config = JSON.parse(data);
            if (!this.config.channels) this.config.channels = [];
            if (!this.config.keywords) this.config.keywords = [];
            if (!this.config.lastMessageIds) this.config.lastMessageIds = {};

            return this.config;
        } catch (error) {
            console.error("Config fayl oqishda xatolik:", error.message);
            return {channels: [], keywords: [], lastMessageIds: {}};
        }
    }
    async saveConfig() {
        try {
            await fs.writeFile(configPath, JSON.stringify(this.config, null, 2), "utf8");
        } catch (error) {
            console.error("Config fayl yozishda xatolik:", error.message);
        }
    }
    async getChannels() {
        if (!this.config) await this.loadConfig();
        return this.config.channels;
    }

    async addChannel(channel) {
        if (!this.config) await this.loadConfig();
        if (this.config.channels.includes(channel)) return false;

        this.config.channels.push(channel);
        await this.saveConfig();
        return true;
    }

    async removeChannel(channel) {
        if (!this.config) await this.loadConfig();
        if (!this.config.channels.includes(channel)) return false;

        this.config.channels = this.config.channels.filter(c => c !== channel);
        await this.saveConfig();
        return true;
    }
    async getKeywords() {
        if (!this.config) await this.loadConfig();
        return this.config.keywords;
    }

    async addKeyword(keyword) {
        if (!this.config) await this.loadConfig();
        const lowerKeyword = keyword.toLowerCase().trim();
        const exists = this.config.keywords.some(k => k.toLowerCase() === lowerKeyword);
        if (exists) return false;

        this.config.keywords.push(keyword.trim());
        await this.saveConfig();
        return true;
    }

    async removeKeyword(keyword) {
        if (!this.config) await this.loadConfig();
        const lowerKeyword = keyword.toLowerCase().trim();

        const exists = this.config.keywords.some(k => k.toLowerCase() === lowerKeyword);
        if (!exists) return false;

        this.config.keywords = this.config.keywords.filter(k => k.toLowerCase() !== lowerKeyword);
        await this.saveConfig();
        return true;
    }
    async getLastMessageId(channel) {
        if (!this.config) await this.loadConfig();
        return this.config.lastMessageIds[channel] || 0;
    }

    async setLastMessageId(channel, messageId) {
        if (!this.config) await this.loadConfig();
        this.config.lastMessageIds[channel] = messageId;
        await this.saveConfig();
    }
}
module.exports = new StorageService();