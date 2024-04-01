import { Request, Response } from "express";
import createServer from "../src/infrastructure/config/server";
import studentRoute from "../src/infrastructure/routes/student.route";

import connectDB from "./infrastructure/config/db";
import mentorRoute from "./infrastructure/routes/mentor.route";
import adminRoute from "./infrastructure/routes/admin.route";
import intializeSocket from "./infrastructure/config/socket";

import { Socket } from "socket.io";
const { Server } = require("socket.io");
const { app, server } = createServer();

const videoSocket = require('./infrastructure/config/videosocket');
// import videoSocket from './infrastructure/config/videosocket';

// Use videoSocket in your code

const port = process.env.PORT || 3000;

app.get("/", (req: Request, res: Response) => {
  res.send("Lets rock & roll");
});
app.use("/api/student", studentRoute);
app.use("/api/mentor", mentorRoute);
app.use("/api/admin", adminRoute);


server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  try {
    connectDB();
  } catch (error: any) {
    console.error("Error connecting to the database:", error.message);
  }
});

intializeSocket(server);

// const io = new Server(server,{cors: {
//   origin: 'http://169.254.160.35:4200',
//   methods: ["GET", "POST"],
//   credentials: true
// }})
// videoSocket(io);
