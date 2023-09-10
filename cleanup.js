const fs = require("fs");

try {
  fs.writeFileSync("./database.json", "{}");
} catch (error) {
  console.error("Error cleaning data:", error);
}
