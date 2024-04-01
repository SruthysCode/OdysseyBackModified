import { ObjectId } from "mongoose";


interface IAdmin {
  id: string;
  name?: string;
  email: string;
  password: string;
  avatar?: string;
  
  }

export default IAdmin;
