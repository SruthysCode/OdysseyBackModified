
import { Request, Response } from "express";
const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;
let token = "";

const authenticateToken = (req: Request, res: Response, next: any) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    token = cookieHeader.split("=")[1];
  }

  jwt.verify(token, secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(200).send({
      message: "Decoded",
      claims: decoded,
    });
    next();
  });
};

export default authenticateToken;
