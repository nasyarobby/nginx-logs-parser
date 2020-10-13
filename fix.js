const fs = require("fs");

const read = fs.readFileSync("./api.access.btn.log");
const lines = read.toString().split("\n");
const goodLines = [];
lines.forEach((line, index) => {
  try {
    JSON.parse(line);
    goodLines.push(line);
  } catch (err) {
    const match = line.match(/requestBody":"(.*)"}/);
    if (match) {
      const newReqBody = match[1].replace(/"/g, '\\"');
      const newLine = line.replace(match[1], newReqBody);
      console.log(newLine);
      goodLines.push(newLine);
    }
  }
});

fs.writeFileSync("./log.log", goodLines.join("\n"));
