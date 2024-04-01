
// import { HttpStatus } from "../../enums/HttpStatus.enum";

import { HttpStatus } from "../../domain/enum/httpStatus.enum";

interface MentorUsecase {
  signupMentor(body: any): Promise<{ status: HttpStatus; data: any }>;
  loginMentor(body: any): Promise<{ status: HttpStatus; data: any }>;
  sendOTP(body: any): Promise<{ status: HttpStatus; data: any }>;
  verifyOTP(body: any): Promise<{ status: HttpStatus; data: any }>;
  mentorList(): Promise<{ status: HttpStatus; data: any }>;
  findmentor(mentorID: any): Promise<{ status: HttpStatus; data: any }>;
  editmentor(body: any): Promise<{ status: HttpStatus; data: any }>;
  passwordchange(body: any): Promise<{ status: HttpStatus; data: any }>;
  UploadImage(req: any): Promise<{ status: HttpStatus; data: any }>;
}

export default MentorUsecase;
