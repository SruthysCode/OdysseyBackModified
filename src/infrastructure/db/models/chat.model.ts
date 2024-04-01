import mongoose from "mongoose";

import IChat from "../../../domain/models/chat";

const ChatSchema = new mongoose.Schema<IChat>({
  roomid: {
    type: Object,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  sender: {
    type: Object,
    required: true,
  },
  receiver: {
    type: Object,
    required: true,
  },
  time: {
    type: Date,
    required: true,
  },
  hasread: {
    type: Boolean,
    required: false,
  },
});

const ChatModel = mongoose.model("Chat", ChatSchema);

export default ChatModel;
