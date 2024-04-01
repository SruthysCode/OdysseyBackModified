

import mongoose from "mongoose";
import IAdmin from "../../../domain/models/admin";


const AdminSchema = new mongoose.Schema<IAdmin>({
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
  avatar: {
    type: String,
    default:
      "https://cdn0.iconfinder.com/data/icons/Student-interface-vol-3-12/66/68-512.png",
  }
});

const AdminModel = mongoose.model("Admin", AdminSchema);

export default AdminModel;
