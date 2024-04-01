
import mongoose, { Schema } from "mongoose";
import IStudent from "../../../domain/models/student";



const NotificationSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  read:{
    type:Boolean,
    default: false,
  }
  
});

const StudentSchema = new mongoose.Schema<IStudent>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: "",
  },
  
  mobile: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default:
      "https://freesvg.org/img/abstract-user-flat-4.png ",
  },
  verified:{
    type:Boolean,
    default: false,
  },
  blocked:{
    type:Boolean,
    default: true,
  },

  notification : [NotificationSchema]
  
});

const StudentModel = mongoose.model("Student", StudentSchema);

export default StudentModel;
