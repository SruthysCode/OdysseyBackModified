import { Request, Response } from "express";

import IChat from "../useCase/Interface/IChat.usecase";
import ChatRepository from "../infrastructure/repository/chat.repository";
import { HttpStatus } from "../domain/enum/httpStatus.enum";
import { ErrorMessage } from "../domain/enum/error.enum";

class ChatUsecase implements IChat {
  constructor(private chatRepository: ChatRepository) {}

  async CheckForRoomID(req: Request) {
    try {
      const studentID = req.headers.studentID;
      const mentorID = req.params.mentorID;
      // console.log("USE ", studentID, mentorID);
      const response = await this.chatRepository.CheckForRoomID(
        studentID,
        mentorID
      );
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
            data: response.data,
          },
        };
      }

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }

  async CheckForRoomIDM(req: Request) {
    try {
      const mentorID =String(req.headers.mentorID);
      const studentID = req.params.studentID;
      // console.log("USE ", studentID, mentorID);
      const response = await this.chatRepository.CheckForRoomID(
        studentID,
        mentorID
      );
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
            data: response.data,
          },
        };
      }

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }


  async StoreChatMessage(req: Request) {
    try {
      const msg = req.body.msg;
      console.log(msg, "msg chat");
      // console.log("USE ", studentID, mentorID);
      const response = await this.chatRepository.StoreChatMessage(msg);
      if (!response.data) {
        return {
          status: HttpStatus.NotFound,
          data: {
            success: false,
            message: response.message,
            data: response.data,
          },
        };
      }

      return {
        status: response.success ? HttpStatus.Success : HttpStatus.ServerError,
        data: {
          success: response.success,
          message: response.message,
          data: response.data,
        },
      };
    } catch (error) {
      return {
        status: HttpStatus.ServerError,
        data: {
          success: false,
          message: ErrorMessage.ServerError,
        },
      };
    }
  }
}

export default ChatUsecase;
