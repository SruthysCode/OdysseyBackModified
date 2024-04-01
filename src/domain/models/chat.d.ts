
import { ObjectId } from "mongoose";


interface IChat {
  
    roomid: ObjectId,        
      message:String,        
      sender: ObjectId,
      receiver:  Object,
      time:  Date,
      hasread: Boolean,
       
  }

export default IChat;
