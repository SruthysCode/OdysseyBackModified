import { ObjectId } from "mongoose";


interface IBook {
  
  title: string;
  author: string;
  link : string;
  shared_date: Date;
  end_date: Date;
  shared_by: ObjectId;
  
  }

export default IBook;
