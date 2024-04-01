import { Request, Response } from "express";

interface IStudentUsecase {
  signupStudent(body: any): Promise<{ status: number; data: any }>;
  sendOTP(body: any): Promise<{ status: number; data: any }>;
  verifyOTP(body: any): Promise<{ status: number; data: any }>;
  loginStudent(body: any): Promise<{ status: number; data: any }>;
  findstudent(StudentId: any): Promise<{ status: number; data: any }>;
  studentList(): Promise<{ status: number; data: any }>;
  editprofile(body: any): Promise<{ status: number; data: any }>;
  passwordchange(body: any): Promise<{ status: number; data: any }>;
  accesschange(body: any): Promise<{ status: number; data: any }>;
  UploadImage(req: any): Promise<{ status: number; data: any }>;
  
}

export default IStudentUsecase;
