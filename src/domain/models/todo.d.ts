
import { ObjectId } from "mongoose";


interface ITodo {
  todo_name: string;
  link : string;
  start_date: Date;
  end_date: Date;
  book_id: ObjectId;
  posted_by : ObjectId;
}

export default ITodo;
