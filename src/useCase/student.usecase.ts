import { Request, Response } from "express";
import StudentRepository from "../infrastructure/repository/student.repository";
import OtpRepository from "../infrastructure/repository/otp.repository";
import IStudent from "../useCase/Interface/IStudent.usecase";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import MyJWTPayLoad from "../domain/models/jwt";
import { HttpStatus } from "../domain/enum/httpStatus.enum";
import cloudinary from "../infrastructure/utils/cloudinary";
import BookRepository from "../infrastructure/repository/book.repository";
import ActivityRepository from "../infrastructure/repository/activity.repository";
import { ErrorMessage } from "../domain/enum/error.enum";

const generator = require("generate-password");
dotenv.config();

const secret = process.env.JWT_SECRET || "itssecret";

class StudentUsecase implements IStudent {
  private StudentRepository: StudentRepository;
  private OtpRepository!: OtpRepository;
  private BookRepository!: BookRepository;
  private ActivityRepository!: ActivityRepository;

  private decodeToken(token: string): MyJWTPayLoad {
    return jwt.verify(token, secret) as MyJWTPayLoad;
  }
  constructor(
    StudentRepository: StudentRepository,
    OtpRepository: OtpRepository,
    BookRepository: BookRepository,
    ActivityRepository: ActivityRepository
  ) {
    this.StudentRepository = StudentRepository;
    this.OtpRepository = OtpRepository;
    this.BookRepository = BookRepository;
    this.ActivityRepository = ActivityRepository;
  }

  async signupStudent(body: any) {
    try {
      const { email, name, password, confirmpassword } = body;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!emailRegex.test(email)) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Give a valid Email",
          },
        };
      }
      if (
        password != confirmpassword ||
        !passwordRegex.test(password as string)
      ) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Retry another password by matching confirmation",
          },
        };
      }
      const emailExist = await this.StudentRepository.authenticateStudent(
        email
      );
      if (emailExist.data) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "User email exist already",
          },
        };
      }
      const hashedPassword = await bcrypt.hash(password as string, 10);
      const response = await this.StudentRepository.signupStudent({
        email,
        name,
        password: hashedPassword,
        // confirmpassword: hashedPassword,
        address: "",
        mobile: "",
        verified: false,
        blocked: true,
      });
      if (!response.data) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: response.message,
          },
        };
      }

      const token = jwt.sign(response.data, secret);
      const student_mail = email;
      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          student_mail: email,
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

  async RefreshToken(body: any) {
    try {
      const refreshtoken = body.studentRefreshToken;
      const tokenPayload = jwt.verify(refreshtoken, secret) as jwt.JwtPayload;
      const email = tokenPayload.email;
      const response = await this.StudentRepository.authenticateStudent(email);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      const token = jwt.sign(
        {
          id: String(response.data._id),
          email: response.data.email,
        },
        secret,
        { expiresIn: 60 * 60 }
      );

      console.log(
        "token : ",
        token,
        String(response.data._id),
        " mmmm ",
        response.data.email
      );
      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: "Student Authenticated",
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

  async sendOTP(body: any) {
    try {
      const { email, isverified } = body;
      if (isverified) {
        const emailExist = await this.StudentRepository.authenticateStudent(
          email
        );
        if (emailExist.data && emailExist.data.verified) {
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: "OTP already verified",
            },
          };
        }
      }
      const otp: string = `${Math.floor(1000 + Math.random() * 9000)}`;
      const otpdel = await this.OtpRepository.deleteOtp(email);
      const otp_details = {
        email: email,
        otp: otp,
      };
      const response = await this.OtpRepository.storeOtp(otp_details);
      if (!response.success) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.verifyEmail,
          pass: process.env.verifyPassword,
        },
      });
      const mailOptions = {
        from: process.env.verifyEmail,
        to: email,
        subject: "Verify Your Email in Read Odyssey",
        html: `<p>Hey ${email} Here is your Verification OTP: <br> Your OTP is <b>${otp}</b> </p><br>
              <i>Otp will Expire in 60 seconds</i>`,
      };
      transporter.sendMail(mailOptions, (err: any) => {
        if (err) {
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: ErrorMessage.ServerError,
            },
          };
        }
      });
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: "OTP generated and send",
          otp: otp,
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
  async verifyOTP(body: any) {
    try {
      const { email, otp } = body;
      const isValid = await this.OtpRepository.checkOtp({ email, otp });
      if (isValid) {
        const verify_student = await this.StudentRepository.updateStatus(email);
        if (verify_student) {
        } else {
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: "Student not updated",
            },
          };
        }
      }
      return {
        status: isValid.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: isValid.success,
          message: isValid.message,
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

  async loginStudent(body: any) {
    try {
      const { email, password } = body;
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
      const response = await this.StudentRepository.authenticateStudent(email);
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
        secret,
        { expiresIn: 60 * 60 * 60 }
      );
      const refreshToken = jwt.sign(
        {
          id: response.data.id,
          email: response.data.email,
        },
        secret,
        { expiresIn: "1d" }
      );

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: "Student Authenticated",
          token: token,
          refreshToken: refreshToken,
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

  async findstudent(StudentId: any) {
    try {
      const response = await this.StudentRepository.findStudent(StudentId);
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

  async studentList() {
    try {
      const response = await this.StudentRepository.studentList();
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

  async editprofile(body: any) {
    try {
      const email = body.student.email;
      const response = await this.StudentRepository.editprofile(
        body.student,
        email
      );

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

  async passwordchange(body: any) {
    try {
      const email = body.email;
      const password = "Aa@12345";

      // const password = generator.generate({
      //   length: 8,
      //   numbers: true,
      //   symbols: true,
      //   lowercase: true,
      //   uppercase: true,
      //   excludeSimilarCharacters: true,
      //   strict: true,
      //   specialChars: '@$!%*#?&',
      // });
      const hashedPassword = await bcrypt.hash(password as string, 10);
      const response = await this.StudentRepository.passwordchange(
        email,
        hashedPassword
      );

      if (!response.success) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: response.message,
          },
        };
      }
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.verifyEmail,
          pass: process.env.verifyPassword,
        },
      });
      const mailOptions = {
        from: process.env.verifyEmail,
        to: email,
        subject: "Request for password in Read Odyssey",
        html: `<p>Hey ${email} Here is your changed password: <br> Your Password is <b>${password}</b> </p><br>
              <i>Please keep your password safe</i>`,
      };
      transporter.sendMail(mailOptions, (err: any) => {
        if (err) {
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: ErrorMessage.ServerError,
            },
          };
        }
      });
      return {
        status: HttpStatus.Success,
        data: {
          success: true,
          message: "Password generated and send",
          password: password,
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
      response = await this.StudentRepository.accesschange(id);

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

  async UploadImage(req: any) {
    try {
      const imagePath = req.file.path;
      const response = await cloudinary.uploader.upload(
        imagePath,
        {},
        (err: any, url: any) => {}
      );
      const secureUrl = response.secure_url;
      const id = req.headers.studentID;
      const responseData = await this.StudentRepository.updateImgDetails(
        id,
        secureUrl
      );
      return {
        status: responseData.success
          ? HttpStatus.Success
          : HttpStatus.ServerError,
        data: {
          success: responseData.success,
          message: responseData.message,
          data: responseData,
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

  async getstudentscount(req: any) {
    try {
      const page: number = Number(req.query.page) || 1;
      const limit: number = Number(req.query.limit) || 5;
      const skip: number = (page - 1) * limit;

      let response = await this.StudentRepository.getStudentsbycount(
        skip,
        limit
      );

      let number = await this.StudentRepository.getStudentcount();
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

  async ChangePassword(req: any) {
    try {
      let StudentId = req.headers.studentID;
      // ***********
      const password = req.body.password;
      const passwordRegex =
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
      if (!passwordRegex.test(password as string)) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Retry another password by matching confirmation",
          },
        };
      }
      const hashedPassword = await bcrypt.hash(password as string, 10);

      let response = await this.StudentRepository.ChangePassword(
        hashedPassword,
        StudentId
      );
      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
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

  async CheckBook() {
    try {
      const response = await this.BookRepository.CheckBook();
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

  async CurrentActivity() {
    try {
      const response = await this.ActivityRepository.CurrentActivity();
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

  async PostActivity(req: any) {
    try {
      const imagePath = req.file.path;
      const activity = JSON.parse(req.body.postDetails);
      const responseUrl = await cloudinary.uploader.upload(
        imagePath,
        {},
        (err, url) => {}
      );
      console.log("After cloudinary in  activity ");

      const secureUrl = responseUrl.secure_url;
      const id = req.headers.studentID;
      const details = {
        activity_link: secureUrl,
        submitted_date: activity.Date,
        todo_id: activity.activity,
        student_id: Object(id),
        blocked: false,
        mark: 0,
        likes: 0,
        comments: [],
      };
      const response = await this.ActivityRepository.PostActivity(details);
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

  async CheckActivity(req: Request) {
    try {
      const activityId = req.params.activityID;
      const studentID = String(req.headers.studentID);
      const response = await this.ActivityRepository.CheckActivity(
        activityId,
        studentID
      );
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

  async Activities(req: Request) {
    try {
      const studentID = String(req.headers.studentID);
      const response = await this.ActivityRepository.Activities(studentID);
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

  async Blog(req: Request) {
    try {
      const response = await this.ActivityRepository.Blog();
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

  async Books(req: Request) {
    try {
      const response = await this.ActivityRepository.Books();
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

  async UpdateLikes(req: Request) {
    try {
      const activityID = req.body.activityID;
      const likes = req.body.likes;
      const likedByStudent=req.body.studentName;
      const response = await this.ActivityRepository.UpdateLikes(
        activityID,
        likes
      );
      console.log("like ", response);
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

      const Details = await this.ActivityRepository.getDetails(activityID);
      console.log("stude", Details.data?.student_id);
      const studentID = String(Details.data?.student_id);
      const updateNotify = await this.StudentRepository.UpdateNotification(
        studentID,
        "Like by " + likedByStudent,
      );

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: response.data,
          studentID: studentID,
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

  async UpdateComment(req: Request) {
    try {
      const comment = req.body.comment;
      const name = req.body.studentName;
      const activityID = req.body.activityID;
      const response = await this.ActivityRepository.UpdateComment(
        activityID,
        comment,
        name
      );
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

      const Details = await this.ActivityRepository.getDetails(activityID);
      console.log("stude", Details.data?.student_id);
      const studentID = String(Details.data?.student_id);
      const updateNotify = await this.StudentRepository.UpdateNotification(
        studentID,
        "Comment by "+ name
      );

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: response.data,
          studentID: studentID,
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

  
  async AllNotifications(req: Request) {
    try {
      const studentID  = String(req.headers.studentID);
      const response = await this.StudentRepository.GetNotifications(studentID)
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
          studentID: studentID,
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

  
  async UpdateNotifications(req: Request) {
    try {
      const studentID  = String(req.headers.studentID);
      const response = await this.StudentRepository.UpdateNotifications(studentID)
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
          studentID: studentID,
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

export default StudentUsecase;
