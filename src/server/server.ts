import express from "express";
import path from "path";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/assets", express.static(path.resolve("./src/server/assets")));

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
