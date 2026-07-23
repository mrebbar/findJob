const test = require("node:test");
const assert = require("node:assert/strict");
const http = require("http");

process.env.BOT_TOKEN = process.env.BOT_TOKEN || "test-token";
process.env.ADMIN_ID = process.env.ADMIN_ID || "1";
process.env.API_ID = process.env.API_ID || "1";
process.env.API_HASH = process.env.API_HASH || "test-hash";
process.env.SESSION = process.env.SESSION || "test-session";
process.env.OUTPUT_CHANNEL = process.env.OUTPUT_CHANNEL || "@test";

const { startHealthServer } = require("../src/webhook");

test("health server responds on /healthz", async () => {
    process.env.PORT = "0";
    const server = await startHealthServer();
    const address = server.address();

    const response = await new Promise((resolve, reject) => {
        const req = http.get({
            host: "127.0.0.1",
            port: address.port,
            path: "/healthz"
        }, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                resolve({ statusCode: res.statusCode, body: data });
            });
        });

        req.on("error", reject);
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body, "ok");

    await new Promise((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
    });
});
