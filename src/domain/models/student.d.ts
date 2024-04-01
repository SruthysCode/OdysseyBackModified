import { ObjectId } from "mongoose";


interface IStudent {
  id: string;
  name?: string;
  email: string;
  password: string;
  address? : string;
   mobile? : string;
  avatar?: string;
  verified: boolean;
  blocked: boolean;
  notification : [];
  
  }

export default IStudent;
