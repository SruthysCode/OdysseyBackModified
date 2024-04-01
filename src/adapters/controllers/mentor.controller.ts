import { Request, Response } from "express";
import MentorUsecase from "../../useCase/mentor.usecase";
// import mentorjwt from "jsonwebtoken";

class MentorController {
  private MentorUsecase: MentorUsecase;

  constructor(MentorUsecase: MentorUsecase) {
    this.MentorUsecase = MentorUsecase;
  }

  async loginMentor(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.loginMentor(req.body);
      const token = response.data.token;

      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "server error",
      });
    }
  }

  async signupMentor(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.signupMentor(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "server error",
      });
    }
  }

  async sendOTP(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.sendOTP(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async verifyOTP(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.verifyOTP(req.body.otp_detail);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async mentorlist(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.mentorList();
      res.status(response.status).send(response.data.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "server error",
      });
    }
  }

  async findmentor(req: Request, res: Response): Promise<void> {
    try {
      const mentorID = req.headers.mentorID;
      if (!mentorID) {
        res.status(401).send({
          success: false,
          message: "Unauthenticated",
        });
      }

      const response = await this.MentorUsecase.findmentor(mentorID);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async editmentor(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.editmentor(
        req.body.updatedData
      );
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async getmentorprofile(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.findmentor(req.params.id);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async passwordchange(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.passwordchange(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async UploadImage(req: Request, res: Response): Promise<void> {
    try {
      const img = req;
      const response = await this.MentorUsecase.UploadImage(req);
      res.status(response.status).send(response.data.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async ChangePassword(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.ChangePassword(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async UploadBook(req: Request, res: Response) {
    try {
      const book = req;
      const response = await this.MentorUsecase.UploadBook(book);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async UploadToDo(req: Request, res: Response): Promise<void> {
    try {
      // const img = req;
      const response = await this.MentorUsecase.UploadToDo(req);
      res.status(response.status).send(response.data.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async GetCurrentBook(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.GetCurrentBook();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async CheckDate(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.CheckDate();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async CheckDateBook(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.CheckDateBook();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async GetBlog(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.GetBlog();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async GetActivities(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.GetActivities();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async UpdateMark(req: Request, res: Response): Promise<void> {
    try {
      const activityID= req.body.activityID;
      const mark = req.body.mark;
      const response = await this.MentorUsecase.UpdateMark(activityID, mark);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async CheckTimeRank(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.CheckTimeRank();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async GetRank(req: Request, res: Response): Promise<void> {
    try {
      const todoID= req.params.todoID
      const response = await this.MentorUsecase.GetRank(todoID);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  
  async FinalRank(req: Request, res: Response): Promise<void> {
    try {
      
      const response = await this.MentorUsecase.FinalRank();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async UpdateLikes(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.UpdateLikes(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  
  async UpdateComment(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.UpdateComment(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async DisplayActivity(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.MentorUsecase.DisplayActivity();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }


}

export default MentorController;
