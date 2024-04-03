import express, { Request, Response, response } from "express";
import StudentRepository from "../repository/student.repository";
import StudentUsecase from "../../useCase/student.usecase";
import StudentController from "../../adapters/controllers/student.controller";
import AuthMiddleware from "../middleware/auth.middleware";
import OtpRepository from "../repository/otp.repository";
import StudAuth from "../middleware/studentAuth.middleware";
import multerConfig from "../middleware/multer.middleware";
import BookRepository from "../repository/book.repository";
import ActivityRepository from "../repository/activity.repository";
import ChatController from "../../adapters/controllers/chat.controller";
import VideoController from "../../adapters/controllers/video.controller";

import ChatUsecase from "../../useCase/chat.usecase";
import chatUsecase from "../../useCase/chat.usecase";

import ChatRepository from "../repository/chat.repository";

const Router = express.Router();
const studentRepository = new StudentRepository();
const chatRepository = new ChatRepository();
const authMiddleware = new AuthMiddleware(studentRepository);
const otpRepository = new OtpRepository();
const bookRepository = new BookRepository();
const activityRepository = new ActivityRepository();
const studentUsecase = new StudentUsecase(
  studentRepository,
  otpRepository,
  bookRepository,
  activityRepository
);
const chatUseCase = new ChatUsecase(chatRepository);
const studentController = new StudentController(studentUsecase);
const chatController = new ChatController(chatUseCase);
const videoController = new VideoController();
Router.post("/login", (req: Request, res: Response) =>
  studentController.loginStudent(req, res)
);

Router.post("/signup", (req: Request, res: Response) => {
  studentController.signupStudent(req, res);
});

Router.post("/studentrefreshtoken", (req: Request, res: Response) => {
  studentController.RefreshToken(req, res);
});

Router.post("/otp", (req: Request, res: Response) =>
  studentController.sendOTP(req, res)
);
Router.post("/otp/verify", (req: Request, res: Response) =>
  studentController.verifyOTP(req, res)
);

Router.get("/studentslist", (req: Request, res: Response) => {
  studentController.studentList(req, res);
});

Router.get("/studentname", StudAuth, (req: Request, res: Response) => {
  studentController.findstudent(req, res);
});

Router.post("/editprofile", StudAuth, (req: Request, res: Response) => {
  studentController.editprofile(req, res);
});

Router.post("/forgotpassword", (req: Request, res: Response) => {
  studentController.passwordchange(req, res);
});

Router.post(
  "/upload-single",
  StudAuth,
  multerConfig.single("image"),
  async (req: Request, res: Response, next) => {
    studentController.UploadImage(req, res);
  }
);

Router.post("/access", StudAuth, (req: Request, res: Response) => {
  studentController.accesschange(req, res);
});

Router.get("/getstudents", (req: Request, res: Response) => {
  studentController.getStudentscount(req, res);
});

Router.post("/changepassword", StudAuth, (req: Request, res: Response) => {
  studentController.ChangePassword(req, res);
});

Router.get("/checkbook", StudAuth, (req: Request, res: Response) => {
  studentController.CheckBook(req, res);
});

Router.get("/currentactivity", StudAuth, (req: Request, res: Response) => {
  studentController.CurrentActivity(req, res);
});

Router.post(
  "/postactivity",
  StudAuth,
  multerConfig.single("activity"),
  (req: Request, res: Response) => {
    studentController.PostActivity(req, res);
  }
);

Router.get(
  "/checkactivity/:activityID",
  StudAuth,
  (req: Request, res: Response) => {
    studentController.CheckActivity(req, res);
  }
);

Router.get("/activities", StudAuth, (req: Request, res: Response) => {
  studentController.Activities(req, res);
});

Router.get("/blog", StudAuth, (req: Request, res: Response) => {
  studentController.Blog(req, res);
});

Router.get("/getbooks", (req: Request, res: Response) => {
  console.log("std get bk");
  studentController.Books(req, res);
});

Router.patch("/updatelikes", (req: Request, res: Response) => {
  studentController.UpdateLikes(req, res);
});

Router.patch("/updatecomment", (req: Request, res: Response) => {
  studentController.UpdateComment(req, res);
});

Router.get(
  "/checkforroomid/:mentorID",
  StudAuth,
  (req: Request, res: Response) => {
    console.log("rou", req.params.mentorID);
    chatController.CheckForRoomID(req, res);
  }
);

Router.post("/storechatmessage", StudAuth, (req: Request, res: Response) => {
  console.log("route chat stud", req.body);
  chatController.StoreChatMessage(req, res);
});

Router.get("/notifyonline", StudAuth, (req: Request, res: Response) => {
  console.log("route video  stud", req.headers.studentID);
  videoController.NotifyOnline(req, res);

  // chatController.StoreChatMessage(req, res);
});

Router.get("/allnotifications", StudAuth, (req: Request, res: Response) => {
  studentController.AllNotifications(req, res);
});

Router.put("/updatenotifications", StudAuth, (req: Request, res: Response) => {
  studentController.UpdateNotifications(req, res);
});


Router.get("/getallactivity", StudAuth, (req: Request, res: Response) => {
  studentController.GetAllActivity(req, res);
});

Router.get("/getrank/:todoID", StudAuth, (req: Request, res: Response) => {
  
  studentController.GetRank(req, res);
});



export default Router;
