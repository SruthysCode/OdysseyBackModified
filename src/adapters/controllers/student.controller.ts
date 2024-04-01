import { Request, Response } from "express";
import StudentUsecase from "../../useCase/student.usecase";
import AuthMiddleware from "../../infrastructure/middleware/auth.middleware";
import jwt from "jsonwebtoken";
import { ErrorMessage } from "../../domain/enum/error.enum";

class StudentController {
  private StudentUsecase: StudentUsecase;
  constructor(StudentUsecase: StudentUsecase) {
    this.StudentUsecase = StudentUsecase;
  }

  async loginStudent(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.loginStudent(req.body);
      const token = response.data.token;
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async signupStudent(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.signupStudent(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async RefreshToken(req: Request, res: Response): Promise<void> {
    try {
     
      const response = await this.StudentUsecase.RefreshToken(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.sendOTP(
        req.body.student_detail
      );
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.verifyOTP(req.body.otp_detail);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async findstudent(req: Request, res: Response): Promise<void> {
    try {
      const student_id = req.headers.studentID;
      let token = "";
      if (!student_id) {
        res.status(401).send({
          success: false,
          message: "Unauthenticated",
        });
      }

      const response = await this.StudentUsecase.findstudent(student_id);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async studentList(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.studentList();
      res.status(response.status).send(response.data.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async editprofile(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.editprofile(req.body);
      res.status(response.status).send(response.data.student);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async passwordchange(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.passwordchange(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async accesschange(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.accesschange(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async UploadImage(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.UploadImage(req);
      res.status(response.status).send(response.data.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async getStudentscount(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.getstudentscount(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async ChangePassword(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.ChangePassword(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async CheckBook(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.CheckBook();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async CurrentActivity(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.CurrentActivity();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async PostActivity(req: Request, res: Response): Promise<void> {
    try {
      
      const response = await this.StudentUsecase.PostActivity(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async CheckActivity(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.CheckActivity(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async Activities(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.Activities(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async Blog(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.Blog(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async Books(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.Books(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async UpdateLikes(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.UpdateLikes(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async UpdateComment(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.UpdateComment(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

  async AllNotifications(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.AllNotifications(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }
  async UpdateNotifications(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.StudentUsecase.UpdateNotifications(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: ErrorMessage.ServerError,
      });
    }
  }

}

export default StudentController;
