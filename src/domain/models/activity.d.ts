import { ObjectId } from "mongoose";

interface IActivity {
  activity_link: string;
  submitted_date: Date;
  todo_id: ObjectId;
  student_id: ObjectId;
  blocked: boolean;
  mark : number;
  likes: number;
  comments: Comments[];
}

interface Comments{
  name : string,
  comment : string,
}
export default IActivity;
