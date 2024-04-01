import { Request, Response, response } from "express";

import AdminUsecase from "../../useCase/admin.usecase";

class AdminController {
  private AdminUseCase: AdminUsecase;

  constructor(AdminUsecase: AdminUsecase) {
    this.AdminUseCase = AdminUsecase;
  }

  async loginAdmin(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.loginadmin(req.body);
      const token = response.data.token;
      res.cookie("adminjwt", token, {
        httpOnly: true,
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "server error",
      });
    }
  }

  async adminname(req: Request, res: Response): Promise<void> {
    try {
      const admin_id = req.headers.adminID;

      if (!admin_id) {
        res.status(401).send({
          success: false,
          message: "Unauthenticated",
        });
      }

      const response = await this.AdminUseCase.adminname(admin_id);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "server error",
      });
    }
  }

  async getmentor(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.getmentor(req.params.id);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "server error",
      });
    }
  }

  async deletementor(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.deletementor(req.body.id);
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
      const response = await this.AdminUseCase.editmentor(req.body.details);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  // *********************

  async getstudent(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.getstudent(req.params.id);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: "server error",
      });
    }
  }

  async deletestudent(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.deletestudent(req.body.id);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async editstudent(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.editstudent(req.body.details);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }

  async accesschange(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.accesschange(req.body);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async getMentorscount(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.getmentorscount(req);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async MentorList(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.MentorList(req);
      res.status(response.status).send(response.data?.mentor);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async Blog(req: Request, res: Response): Promise<void> {
    try {
      
      const response = await this.AdminUseCase.Blog();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async Block(req: Request, res: Response): Promise<void> {
    try {
      const response = await this.AdminUseCase.Block(req.body.activityID);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  async UnBlock(req: Request, res: Response): Promise<void> {
    try {
      
      const response = await this.AdminUseCase.UnBlock(req.body.activityID);
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

  
  async GetCount(req: Request, res: Response): Promise<void> {
    try {
      
      const response = await this.AdminUseCase.GetCount();
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Server Error",
      });
    }
  }

}

export default AdminController;
