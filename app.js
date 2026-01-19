const express = require("express");
const path = require("path");

const PORT = 3001;

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
