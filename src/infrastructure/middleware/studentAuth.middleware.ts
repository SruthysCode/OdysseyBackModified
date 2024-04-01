
import { Request, Response, NextFunction } from "express";
import MyJWTPayLoad from "../../domain/models/jwt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const secret = process.env.JWT_SECRET || "itssecret";
function decodeToken(token: string): MyJWTPayLoad {
  return jwt.verify(token, secret) as MyJWTPayLoad;
}
function studentAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }
  try {
    const tokenPayload = decodeToken(token);
    req.headers.studentID = tokenPayload.id;
    const studentID = tokenPayload.id;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to authenticate",
    });
  }
}
export default studentAuth;
