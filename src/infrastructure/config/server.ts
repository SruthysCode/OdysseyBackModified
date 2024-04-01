
import express from "express";
import cors from "cors";
import http from "http";
import nocache from "nocache";

const path = require("path");
const createServer = () => {
  const app = express();
  const server = http.createServer(app);

  app.use(
    cors({
      credentials: true,
      origin: ["http://localhost:4200"],
    })
  );

  app.use(nocache());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use("/static", express.static(path.join(__dirname, "/public")));

  return { app, server };
};

export default createServer;
