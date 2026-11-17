const fs = require("node:fs");
const path = require("node:path");

const outputDirectory = path.join(__dirname, "dist");
const files = ["index.html", "app.js", "styles.css"];

fs.mkdirSync(outputDirectory, { recursive: true });

for (const file of files) {
  fs.copyFileSync(path.join(__dirname, file), path.join(outputDirectory, file));
}

console.log(`Built frontend into ${outputDirectory}`);
