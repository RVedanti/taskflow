import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "taskflow_secret";

export const authenticate = (req: any, res: any, next: any) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, JWT_SECRET) as {
            userId: string;
            email: string;
        };

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
};