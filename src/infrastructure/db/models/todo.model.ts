

import mongoose from "mongoose";
import ITodo from "../../../domain/models/todo";


const TodoSchema = new mongoose.Schema<ITodo>({
  todo_name: {
    type: String,
    required: true,
  },
  link:{
    type : String,
    required : true,
  },
  start_date: {
    type: Date,
    required: true,
  },
  end_date: {
    type: Date,
    required: true,
  },
 book_id: {
    type: Object,
    required: true,
},
posted_by :{
  type : Object,
  required: true,
}
 
});

const Todo = mongoose.model("Todo", TodoSchema);

export default Todo;
