import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import routes from "./http/routes/index.routes.js";

const app = express();

// FRONTEND QUE VAI ACESSAR SUA API
const allowedOrigins = [
	"http://localhost:5173", // Vite
	"http://localhost:3000", // React padrão
	"http://127.0.0.1:5173",
	"https://seu-frontend.com", // produção (opcional)
	"null",
];

app.use(express.json());
app.use(cookieParser());

// CORS
app.use(
	cors({
		origin: (origin, callback) => {
			// permite ferramentas locais sem origem (Postman / curl)
			if (!origin) return callback(null, true);

			if (allowedOrigins.includes(origin)) {
				return callback(null, true);
			}

			return callback(new Error("Not allowed by CORS"));
		},
		credentials: true, // Obrigatório p/ cookies HTTP-only
	}),
);

// Opcional mas útil p/ cookies cross-site
app.use((req, res, next) => {
	res.header("Access-Control-Allow-Credentials", "true");
	next();
});

app.get("/health", (req, res) => {
	res.json({ ok: true });
});

app.use("/api", routes);

app.listen(process.env.PORT, () => {
	console.log(`Server running on http://localhost:${process.env.PORT}`);
});
