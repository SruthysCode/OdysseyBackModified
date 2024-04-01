import { ErrorMessage } from "../../domain/enum/error.enum";
import Room from "../db/models/room.model";
import Chat from "../db/models/chat.model";
const mongoose = require("mongoose");

class ChatRepository {
  async CheckForRoomID(studentID: any, mentorID: string) {
    try {
      const roomid = await Room.find({
        studentid: studentID,
        mentorid: mentorID,
      });
      // console.log("Room ", roomid);

      if (!roomid || roomid.length == 0) {
        // console.log("in !");

        const details = {
          studentid: studentID,
          mentorid: mentorID,
        };
        // console.log(details, " dets for new rooooom");
        const newroomid = await Room.create(details);
        // console.log("new room id  ", newroomid);

        if (!newroomid)
          return {
            success: false,
            message: ErrorMessage.NotFound,
          };
        else {
          const room = newroomid;
          const chat = await Chat.find({roomid : room._id}).sort({time: -1});
          return {
            success: true,
            message: "Room id fetched",
            data: { room, chat},
          };
        }
      }
      const room = roomid[0];
      // console.log("in roomdata", room, room._id);
      const chat = await Chat.find({roomid : String(room._id)}).sort({time: 1});
        // console.log("chat is ", chat)
    
      return {
        success: true,
        message: "Room id fetched",
        data: { room, chat},
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async StoreChatMessage(msg: any) {
    try {
      // console.log("Room ", msg);
      const details = await Chat.create(msg)
console.log("chat up ", details)

      if(!msg)
          return {
            success: false,
            message: ErrorMessage.NotFound,
          };
        else {          
          
          return {
            success: true,
            message: "Room id fetched",
            data: { details},
          };
        }
      }
    catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  
  }
}

export default ChatRepository;
