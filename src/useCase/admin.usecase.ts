import { HttpStatus } from "../domain/enum/httpStatus.enum";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import MyJWTPayLoad from "../domain/models/jwt";
import AdminRepository from "../infrastructure/repository/admin.repository";
import authenticateToken from "../infrastructure/middleware/token.middleware";
import MentorRepository from "../infrastructure/repository/mentor.repository";
import StudentRepository from "../infrastructure/repository/student.repository";
import IAdmin from "../useCase/Interface/IAdmin.usecase";
import { response } from "express";
import ActivityRepository from "../infrastructure/repository/activity.repository";
import { ErrorMessage } from "../domain/enum/error.enum";
import BookRepository from "../infrastructure/repository/book.repository";

require("dotenv").config();
const secret = process.env.JWT_SECRET || "itssecret";

class AdminUsecase implements IAdmin {
  private decodeToken(token: string): MyJWTPayLoad {
    return jwt.verify(token, secret) as MyJWTPayLoad;
  }

  constructor(
    private adminRepository: AdminRepository,
    private mentorRepository: MentorRepository,
    private studentRepository: StudentRepository,
    private activityRepository: ActivityRepository,
    private bookRepository : BookRepository,
  ) {
    this.adminRepository = adminRepository;
  }

  async loginadmin(body: any) {
    try {
      const { email, password } = body.details;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!emailRegex.test(email) || !passwordRegex.test(password)) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: "Invalid email or password format",
          },
        };
      }
      const response = await this.adminRepository.authenticateAdmin(email);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      const comparedPassword = await bcrypt.compare(
        password,
        response.data.password
      );
      if (!comparedPassword) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: "Password is not match",
          },
        };
      }
      const token = jwt.sign(
        {
          id: response.data.id,
          email: response.data.email,
        },
        secret
      );

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: "admin Authenticated",
          token: token,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async adminname(body: any) {
    try {
      const admin_id = body;

      const response = await this.adminRepository.adminprofile(admin_id);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }

      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async deletementor(id: string) {
    try {
      const response = await this.mentorRepository.deletementor(id);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: response.message,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async getmentor(id: string) {
    try {
      const response = await this.mentorRepository.findmentor(id);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async editmentor(details: any) {
    try {
      const response = await this.mentorRepository.editmentor(details);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  //********************************* */

  async deletestudent(id: string) {
    try {
      const response = await this.studentRepository.deletestudent(id);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: response.message,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async getstudent(id: string) {
    try {
      const response = await this.studentRepository.findStudent(id);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async editstudent(details: any) {
    try {
      const response = await this.studentRepository.editprofile(
        details,
        details.email
      );
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async accesschange(body: any) {
    try {
      const id = body.id;
      let response;
      response = await this.mentorRepository.accesschange(id);

      // if (id) {
      //   response = await this.MentorRepository.accesschangeunblock(id);
      // } else {
      //   response = await this.MentorRepository.accesschangeblock(id);
      // }

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          student: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async getmentorscount(req: any) {
    try {
      const page: number = Number(req.query.page) || 1;
      const limit: number = Number(req.query.limit) || 5;
      const skip: number = (page - 1) * limit;

      let response = await this.mentorRepository.getMentorsbycount(skip, limit);

      let number = await this.mentorRepository.getMentorcount();
      let count = Number(number.data);
      if (req.query.page) {
        if (skip >= count) {
          return {
            status: 404,
            message: "Page not found!",
          };
        }
      }

      return {
        status: 200,
        message: response.message,
        data: {
          total: count,
          mentor: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async MentorList(req: any) {
    try {
      let response = await this.mentorRepository.mentorList();

      if (!response.success) {
        return {
          status: 404,
          message: "Page not found!",
        };
      }

      return {
        status: 200,
        message: response.message,
        data: {
          mentor: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async Blog() {
    try {
      const response = await this.activityRepository.Blog();
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
            data: response.data,
          },
        };
      }

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async Block(activityID: string) {
    try {
      const response = await this.activityRepository.Block(activityID);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
            data: response.data,
          },
        };
      }

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async UnBlock(activityID: string) {
    try {
      const response = await this.activityRepository.UnBlock(activityID);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
            data: response.data,
          },
        };
      }

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  
  async GetCount() {
    try {
      const response = await this.studentRepository.getStudentcount();
      const Mentors = await this.mentorRepository.getMentorcount();
      const books = await this.bookRepository.getBookcount();
      const activitys= await this.activityRepository.getActivitycount();

      console.log(response,Mentors, books, activitys, " counts")
     const  counts ={
        students : response.data,
        mentors : Mentors.data,
        books : books.data,
        activitys : activitys.data
      }

      
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
            data: response.data,
          },
        };
      }

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: counts,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

}

export default AdminUsecase;
