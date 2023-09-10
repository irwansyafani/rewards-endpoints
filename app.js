const express = require("express");
const app = express();

const PORT = +process.env.PORT || 3000;
const routes = require("./routes");

app.use("/", routes);

const server = app.listen(PORT, () => PORT);

module.exports = { server };
