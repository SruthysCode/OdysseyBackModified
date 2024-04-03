import { Request, Response } from "express";
import MentorRepository from "../infrastructure/repository/mentor.repository";
import nodemailer from "nodemailer";
// import IMentor from "../interfaces/Mentor";
import mentorjwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

import MyJWTPayLoad from "../domain/models/jwt";
import { HttpStatus } from "../domain/enum/httpStatus.enum";
import OtpRepository from "../infrastructure/repository/otp.repository";
import cloudinary from "../infrastructure/utils/cloudinary";
import IMentor from "../useCase/Interface/IMentor.usecase";
import ActivityRepository from "../infrastructure/repository/activity.repository";
import { ErrorMessage } from "../domain/enum/error.enum";
import StudentRepository from "../infrastructure/repository/student.repository";

const generator = require("generate-password");

dotenv.config();

const secret = process.env.JWT_SECRET || "itssecret";

class MentorUsecase implements IMentor {
  private decodeToken(token: string): MyJWTPayLoad {
    return mentorjwt.verify(token, secret) as MyJWTPayLoad;
  }
  constructor(
    private MentorRepository: MentorRepository,
    private otprepository: OtpRepository,
    private ActivityRepository: ActivityRepository,
    private studentRepository: StudentRepository
  ) {
    // this.MentorRepository = MentorRepository;
  }

  async signupMentor(body: any) {
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
      const emailExist = await this.MentorRepository.authenticateMentor(email);
      if (emailExist.data) {
        return {
          status: HttpStatus.ServerError,
          data: {
            success: false,
            message: "Mentor email exist already",
          },
        };
      }
      const hashedPassword = await bcrypt.hash(password as string, 10);
      const response = await this.MentorRepository.signupMentor({
        email,
        name,
        address: "",
        mobile: "",
        password: hashedPassword,
        avatar: "https://freesvg.org/img/abstract-user-flat-4.png",
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

      const token = mentorjwt.sign(response.data, secret);

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          mentor_mail: email,
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

  async loginMentor(body: any) {
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
      const response = await this.MentorRepository.authenticateMentor(email);
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
      const token = mentorjwt.sign(
        {
          id: response.data.id,
          email: response.data.email,
        },
        secret,
        { expiresIn: 60 * 60 * 60 }
      );

      const refreshToken = mentorjwt.sign(
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
          message: "Mentor Authenticated",
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

  async sendOTP(body: any) {
    try {
      const { email, isverified } = body.signup_detail;
      if (isverified) {
        const emailExist = await this.MentorRepository.authenticateMentor(
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
      const otpdel = await this.otprepository.deleteOtp(email);
      const otp_details = {
        email: email,
        otp: otp,
      };
      const response = await this.otprepository.storeOtp(otp_details);
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
      const isValid = await this.otprepository.checkOtp({ email, otp });
      if (isValid) {
        const verify_Mentor = await this.MentorRepository.updateStatus(email);
        if (verify_Mentor) {
        } else {
          return {
            status: HttpStatus.ServerError,
            data: {
              success: false,
              message: "Mentor not updated",
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

  async mentorList() {
    try {
      const response = await this.MentorRepository.mentorList();
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

  async findmentor(mentorID: any) {
    try {
      const response = await this.MentorRepository.findmentor(mentorID);
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

  async editmentor(body: any) {
    try {
      const email = body.email;

      const response = await this.MentorRepository.editmentor(body);

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
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

  async passwordchange(body: any) {
    try {
      const email = body.email;
      // const password = "Aa@12345";

      const password = generator.generate({
        length: 8,
        numbers: true,
        symbols: true,
        uppercase: false,
        excludeSimilarCharacters: true,
        strict: true,
      });
      const hashedPassword = await bcrypt.hash(password as string, 10);
      const response = await this.MentorRepository.passwordchange(
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

  async UploadImage(req: any) {
    try {
      const imagePath = req.file.path;
      const response = await cloudinary.uploader.upload(
        imagePath,
        {},
        (err, url) => {}
      );

      const secureUrl = response.secure_url;
      const id = req.headers.mentorID;
      const responseData = await this.MentorRepository.updateImgDetails(
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

  async ChangePassword(req: any) {
    try {
      let MentorId = req.headers.mentorID;
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

      let response = await this.MentorRepository.ChangePassword(
        hashedPassword,
        MentorId
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

  async UploadBook(req: any) {
    try {
      const bookPath = req.file.path;
      const bookDetails = JSON.parse(req.body.bookDetails);
      const response = await cloudinary.uploader.upload(
        bookPath,
        {},
        (err, url) => {}
      );
      console.log("Cloud response after book upload", response);

      const secureUrl = response.secure_url;
      const id = req.headers.mentorID;
      const details = {
        title: bookDetails.name,
        author: bookDetails.author,
        link: secureUrl,
        shared_date: bookDetails.startDateis,
        end_date: bookDetails.endDateis,
        shared_by: id,
      };
      const responseData = await this.MentorRepository.uploadBookDetails(
        details
      );

      return {
        status: responseData.success
          ? HttpStatus.Success
          : HttpStatus.ServerError,
        data: {
          message: responseData.message,
          data: responseData.data,
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

  async UploadToDo(req: any) {
    try {
      const imagePath = req.file.path;
      const activity = JSON.parse(req.body.activity);
      const response = await cloudinary.uploader.upload(
        imagePath,
        {},
        (err, url) => {}
      );
      console.log("After todoupload in cloud ", response);
      const secureUrl = response.secure_url;
      const id = req.headers.mentorID;
      const todoDetails = {
        todo_name: activity.name,
        link: secureUrl,
        start_date: new Date(Date.parse(activity.startDateis)),
        end_date: new Date(Date.parse(activity.endDateis)),
        book_id: activity.book,
        posted_by: id,
      };

      const responseData = await this.MentorRepository.uploadToDo(todoDetails);
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

  async GetCurrentBook() {
    try {
      const response = await this.MentorRepository.GetCurrentBook();
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

  async CheckDate() {
    try {
      const response = await this.MentorRepository.CheckDate();
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

  async CheckDateBook() {
    try {
      const response = await this.MentorRepository.CheckDateBook();
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

  async GetBlog() {
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

  async GetActivities() {
    try {
      const response = await this.ActivityRepository.GetActivityForMarks();
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

  async UpdateMark(activityID: string, mark: number) {
    try {
      console.log("upmark3");

      const response = await this.ActivityRepository.UpdateMark(
        activityID,
        mark
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

  async CheckTimeRank() {
    try {
      const response = await this.ActivityRepository.CheckTimeRank();
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

  async GetRank(todoID: string) {
    try {
      const response = await this.ActivityRepository.GetRankList(todoID);
      // const response = await this.ActivityRepository.GetRank();
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

  async FinalRank() {
    try {
      const response = await this.ActivityRepository.getFinalRank();

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
      console.log("uplike");
      const activityID = req.body.activityID;
      const likes = req.body.likes;
      const name = req.body.mentorName;

      const response = await this.ActivityRepository.UpdateLikes(
        activityID,
        likes
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
      console.log("mentor", Details.data?.student_id);
      const studentID = String(Details.data?.student_id);
      const updateNotify = await this.studentRepository.UpdateNotification(
        studentID,
        "Like by " + name
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
      const name = req.body.mentorName;
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
      console.log("mentor", Details.data?.student_id);
      const studentID = String(Details.data?.student_id);
      const updateNotify = await this.studentRepository.UpdateNotification(
        studentID,
        "Comment by " + name
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

  async DisplayActivity() {
    try {
      const response = await this.ActivityRepository.DisplayActivity();
      // const response = await this.ActivityRepository.GetRank();
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
}

export default MentorUsecase;
