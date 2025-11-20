const fs = require("fs");
const path = require("path");
const strip = require("strip-comments");

function cleanFile(filePath) {
    const code = fs.readFileSync(filePath, "utf8");

    let cleaned;
    try {
        cleaned = strip(code);
    } catch (err) {
        console.log("⚠️ Skipped (parser error):", filePath);
        return;
    }

    fs.writeFileSync(filePath, cleaned);
    console.log("✔ Cleaned:", filePath);
}

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const full = path.join(dir, file);

        if (fs.statSync(full).isDirectory()) {
            walk(full);
        } else if (/\.(ts|js|html|css|scss|cs)$/i.test(full)) {
            cleanFile(full);
        }
    });
}

walk("./src");  // or your entire project root
