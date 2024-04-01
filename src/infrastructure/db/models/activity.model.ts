

import mongoose from "mongoose";
import IActivity from "../../../domain/models/activity";


const ActivitySchema = new mongoose.Schema<IActivity>({
 activity_link: {
    type: String,
    required: true,
  },
  submitted_date: {
    type: Date,
    required: true,
  },
  todo_id: {
    type: Object,
    },
  student_id: {
      type: Object,
      },

    blocked :{
      type: Boolean,
      default: false,
    },
    mark :{
      type : Number,
      default :0,
    } , 
    likes :{
        type : Number,
        default :0,
      },
      comments: [
        {
          name: {
            type: String,
          
          },
          comment: {
            type: String,
  
          }
        }
      ]
  },
);

const Activity = mongoose.model("Activity", ActivitySchema);

export default Activity;
