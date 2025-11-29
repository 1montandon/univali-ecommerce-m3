import jwt from "jsonwebtoken";
import "dotenv/config";

export async function verifyJWT(req, res, next) {
	const authHeader = req.headers["authorization"];
	if (!authHeader) return res.status(401).json({ message: "Missing auth header" });

	const token = authHeader.split(" ")[1];
	if (!token) return res.status(401).json({ message: "Missing token" });

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) return res.status(401).json({ message: "Invalid token" });

		req.userId = decoded.userId;
		next();
	});
}
