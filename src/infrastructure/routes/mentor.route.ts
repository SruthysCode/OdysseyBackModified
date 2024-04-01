import express, { NextFunction, Request, Response } from "express";
import MentorRepository from "../repository/mentor.repository";
import OtpRepository from "../repository/otp.repository";
import MentorUsecase from "../../useCase/mentor.usecase";
import MentorController from "../../adapters/controllers/mentor.controller";
import AuthMiddleware from "../middleware/auth.middleware";

import MentorAuth from "../middleware/mentorAuth.middleware";
import multerConfig from "../middleware/multer.middleware";
import ActivityRepository from "../repository/activity.repository";
import ChatController from "../../adapters/controllers/chat.controller";
import ChatUsecase from "../../useCase/chat.usecase"; // This import is enough
import ChatRepository from "../repository/chat.repository";
import StudentRepository from "../repository/student.repository";

const Router = express.Router();
const mentorRepository = new MentorRepository();
const otprepository = new OtpRepository();
const chatRepository = new ChatRepository();
const activityrepository = new ActivityRepository();
const studentrepository = new StudentRepository();
// const authMiddleware = new AuthMiddleware(mentorRepository);
const mentorUsecase = new MentorUsecase(
  mentorRepository,
  otprepository,
  activityrepository,
  studentrepository
);
const chatUsecase = new ChatUsecase(chatRepository);
const mentorController = new MentorController(mentorUsecase);
const chatController= new ChatController(chatUsecase);

Router.post("/login", (req: Request, res: Response) =>
  mentorController.loginMentor(req, res)
);

Router.post("/signup", (req: Request, res: Response) => {
  mentorController.signupMentor(req, res);
});

Router.post("/otp", (req: Request, res: Response) =>
  mentorController.sendOTP(req, res)
);
Router.post("/otp/verify", (req: Request, res: Response) =>
  mentorController.verifyOTP(req, res)
);

Router.get("/mentorslist", (req: Request, res: Response) => {
  mentorController.mentorlist(req, res);
});

Router.get("/mentorname", MentorAuth, (req: Request, res: Response) => {
  mentorController.findmentor(req, res);
});

Router.put("/editmentor", MentorAuth, (req: Request, res: Response) => {
  mentorController.editmentor(req, res);
});

Router.get(
  "/getmentorprofile/:id",
  MentorAuth,
  (req: Request, res: Response) => {
    mentorController.getmentorprofile(req, res);
  }
);

Router.get("/getmentor/", MentorAuth, (req: Request, res: Response) => {});

Router.post("/forgotpassword", (req: Request, res: Response) => {
  mentorController.passwordchange(req, res);
});

Router.post(
  "/upload-single",
  MentorAuth,
  multerConfig.single("image"),
  async (req: Request, res: Response, next) => {
    mentorController.UploadImage(req, res);
  }
);

Router.post("/changepassword", MentorAuth, (req: Request, res: Response) => {
  mentorController.ChangePassword(req, res);
});

// Router.post(
//   "/upload-book",
//   MentorAuth,
//   multerConfig.single("book"),
//   async (req: Request, res: Response, next) => {
//     console.log("from route ", req.file)
//     // mentorController.UploadBook(req, res);
//   }
// );

Router.post(
  "/upload-book",
  MentorAuth,
  multerConfig.single("book"),
  async (req: Request, res: Response, next) => {
    mentorController.UploadBook(req, res);
  }
);

Router.post(
  "/upload-todo",
  MentorAuth,
  multerConfig.single("todo"),
  async (req: Request, res: Response, next) => {
    mentorController.UploadToDo(req, res);
  }
);

Router.get("/currentbook", MentorAuth, (req: Request, res: Response) => {
  mentorController.GetCurrentBook(req, res);
});

Router.get("/checkDate", MentorAuth, (req: Request, res: Response) => {
  mentorController.CheckDate(req, res);
});

Router.get("/checkDateBook", MentorAuth, (req: Request, res: Response) => {
  mentorController.CheckDateBook(req, res);
});

Router.get("/mentorblog", MentorAuth, (req: Request, res: Response) => {
  mentorController.GetBlog(req, res);
});

Router.get("/getactivity", MentorAuth, (req: Request, res: Response) => {
    mentorController.GetActivities(req, res);
});

Router.put("/updatemark", MentorAuth, (req: Request, res: Response) => {  
   mentorController.UpdateMark(req, res);
});

Router.get("/checktimeforrank", MentorAuth, (req: Request, res: Response) => {
  mentorController.CheckTimeRank(req, res);
});


Router.get("/getranklist", MentorAuth, (req: Request, res: Response) => {  
  
  mentorController.GetRank(req, res);
});


Router.patch("/updatelikes", (req: Request, res: Response) => {
  mentorController.UpdateLikes(req, res);
});

Router.patch("/updatecomment", (req: Request, res: Response) => {
  mentorController.UpdateComment(req, res);
});


Router.get(
  "/checkforroomid/:studentID",
  MentorAuth,
  (req: Request, res: Response) => {
    console.log("rou", req.params.studentID);
    chatController.CheckForRoomIDM(req, res);
  }
);

Router.post("/storechatmessage", MentorAuth, (req: Request, res: Response) => {
  
  chatController.StoreChatMessage(req, res);
});


Router.get("/displayactivity", MentorAuth, (req: Request, res: Response) => {
  console.log("route mentor ",req.body)
  //ActivityController
  mentorController.DisplayActivity(req, res);
});

Router.get(
  "/generaterank/:todoID",
  MentorAuth,
  (req: Request, res: Response) => {
    console.log("rou", req.params.todoID);
    mentorController.GetRank(req,res)
  }
);


Router.get(
  "/finalrank",
  MentorAuth,
  (req: Request, res: Response) => {
    console.log("rou");
    mentorController.FinalRank(req,res)
  }
);



export default Router;
