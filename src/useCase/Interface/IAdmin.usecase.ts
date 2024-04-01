
import { HttpStatus } from "../../domain/enum/httpStatus.enum";
import IMentor from "../Interface/IMentor.usecase";

interface AdminUsecase {
  loginadmin(body: any): Promise<{ status: HttpStatus; data: any }>;
  adminname(body: any): Promise<{ status: HttpStatus; data: any }>;
  deletementor(id: string): Promise<{ status: HttpStatus; data: any }>;
  getmentor(id: string): Promise<{ status: HttpStatus; data: any }>;
  editmentor(details: any): Promise<{ status: HttpStatus; data: any }>;
  deletestudent(id: string): Promise<{ status: HttpStatus; data: any }>;
  getstudent(id: string): Promise<{ status: HttpStatus; data: any }>;
  editstudent(details: any): Promise<{ status: HttpStatus; data: any }>;
  accesschange(body: any): Promise<{ status: HttpStatus; data: any }>;
  

  
}

export default AdminUsecase;
