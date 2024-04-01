
import mongoose from "mongoose";

import IRoom from "../../../domain/models/room";

const RoomSchema = new mongoose.Schema<IRoom>({
  
  studentid: {
    type: Object,
    required: true,
  },
  mentorid: {
    type: Object,
    required: true,
  },
  
});

const RoomModel = mongoose.model("Room", RoomSchema);

export default RoomModel;
