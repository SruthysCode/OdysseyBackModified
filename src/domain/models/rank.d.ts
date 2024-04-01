
import { ObjectId } from "mongoose";


export interface IRank {  
  todoid : string;
  ranklist: IRanklist[];
} 

  export interface IRanklist{
    rank : number,
    name : string,
    student_id :string,
    mark : number, 
  }


