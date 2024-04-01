
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import MyJWTPayLoad from "../../domain/models/jwt";
import StudentRepository from "../repository/student.repository";
import { Role } from "../../domain/enum/roles.enum";
import MentorRepository from "../repository/mentor.repository";

class AuthMiddleware {
  private StudentRepository: StudentRepository;
  private decodeToken(token: string): MyJWTPayLoad {
    return jwt.verify(token, "itssecret") as MyJWTPayLoad;
  }

  constructor(StudentRepository: StudentRepository) {
    this.StudentRepository = StudentRepository;
  }

  async authStudent(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return {
          status: 500,
          data: {
            success: false,
            message: "server error",
          },
        };
      }
      const tokenPayload = this.decodeToken(token);
      const response = await this.StudentRepository.findStudent(
        tokenPayload.id
      );
      if (response.data) {
        next();
      } else {
        res.status(500).send({
          success: false,
          message: "Student is Blocked, Try again after login in",
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }
  async adminCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers["authorization"];
      if (!token) {
        return {
          status: 500,
          data: {
            success: false,
            message: "server error",
          },
        };
      }
      const tokenPayload = this.decodeToken(token);
      if (tokenPayload.role == Role.Admin) {
        next();
      } else {
        res.status(500).send({
          success: false,
          message: "Try again after login in",
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "server error",
      });
    }
  }
}

export default AuthMiddleware;
