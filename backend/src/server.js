import express from "express";
import "dotenv/config";
import cors from "cors";
import routes from "./http/routes/index.routes.js";
import { importProductsFromFakeStore } from "./http/services/import-from-fakestore.js";

const app = express();

app.use(express.json());

app.use(cors());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/api", routes);

async function startServer() {
  console.log("⏳ Inicializando aplicação...");

  await importProductsFromFakeStore();

  console.log("🚀 Inicialização concluída!");

  app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
  });
}

startServer();
