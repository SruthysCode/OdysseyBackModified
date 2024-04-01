

import mongoose from "mongoose";
import IMentor from "../../../domain/models/mentor";


const MentorSchema = new mongoose.Schema<IMentor>({
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
    default: "googleAuth",
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
  role: {
    type: String,
    default: "Mentor",
  },
  verified:{
    type: Boolean,
    default: false,
  },
  blocked:{
    type: Boolean,
    default: true,
  }
});

const MentorModel = mongoose.model("Mentor", MentorSchema);

export default MentorModel;
