import express, { NextFunction, Request, Response } from "express";
import AdminRepository from "../repository/admin.repository";
import AdminUsecase from "../../useCase/admin.usecase";
import AdminController from "../../adapters/controllers/admin.controller";
import AuthMiddleware from "../middleware/auth.middleware";
import MentorRepository from "../repository/mentor.repository";
import StudentRepository from "../repository/student.repository";
import AdminAuth from "../middleware/adminAuth.middleware";
import ActivityRepository from "../repository/activity.repository";
import BookRepository from "../repository/book.repository";

const Router = express.Router();
const adminRepository = new AdminRepository();
const mentorRepository = new MentorRepository();
const studentRepository = new StudentRepository();
const activityRepository = new ActivityRepository();
const bookRepository = new BookRepository();

// const authMiddleware = new AuthMiddleware(adminRepository);
const adminUsecase = new AdminUsecase(
  adminRepository,
  mentorRepository,
  studentRepository,
  activityRepository,
  bookRepository,
);
const adminController = new AdminController(adminUsecase);

Router.post("/adminlogin", (req: Request, res: Response) =>
  adminController.loginAdmin(req, res)
);

Router.get("/adminname", AdminAuth, (req: Request, res: Response) => {
  adminController.adminname(req, res);
});

Router.get("/getmentor/:id", AdminAuth, (req: Request, res: Response) => {
  adminController.getmentor(req, res);
});

Router.post("/deletementor", AdminAuth, (req: Request, res: Response) => {
  adminController.deletementor(req, res);
});

Router.post("/editmentor", AdminAuth, (req: Request, res: Response) => {
  adminController.editmentor(req, res);
});

Router.get("/getstudent/:id", AdminAuth, (req: Request, res: Response) => {
  adminController.getstudent(req, res);
});

Router.post("/deletestudent", AdminAuth, (req: Request, res: Response) => {
  adminController.deletestudent(req, res);
});

Router.post("/editstudent", AdminAuth, (req: Request, res: Response) => {
  adminController.editstudent(req, res);
});

Router.post("/accessmentor", AdminAuth, (req: Request, res: Response) => {
  adminController.accesschange(req, res);
});

Router.get("/getmentors", (req: Request, res: Response) => {
  adminController.getMentorscount(req, res);
});

Router.get("/mentorslist", (req: Request, res: Response) => {
  adminController.MentorList(req, res);
});

Router.get("/blog", AdminAuth, (req: Request, res: Response) => {
  adminController.Blog(req, res);
});

Router.put("/blockactivity", AdminAuth, (req: Request, res: Response) => {
  adminController.Block(req, res);
});

Router.put("/unblockactivity", AdminAuth, (req: Request, res: Response) => {
  adminController.UnBlock(req, res);
});


Router.get("/getcounts", (req: Request, res: Response) => {
  adminController.GetCount(req, res);
});

export default Router;
