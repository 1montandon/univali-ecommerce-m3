import jwt from "jsonwebtoken";
import "dotenv/config";

export async function verifyJWT(req, res, next) {
	const authHeader = req.headers["authorization"];
	if (!authHeader) return res.status(401);

	const token = authHeader.split("")[1];
	jwt.verify(
		token,
		process.env.ACCESS_TOKEN_SECRET,
		(err,
		(decoded) => {
			if (err) return res.status(403);
			req.user = decoded.userId;
			next();
		}),
	);
}
