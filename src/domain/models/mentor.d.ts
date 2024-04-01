
import { ObjectId } from "mongoose";


interface IMentor {
  id: string;
  name?: string;
  email: string;
  address: string,
  mobile: string,
  password: string;
  avatar?: string;
  role?: string;
  verified: boolean;
  blocked: boolean;
  
  }

export default IMentor;
