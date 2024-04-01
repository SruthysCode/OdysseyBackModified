
import { Request, Response, response } from "express";

import ChatUsecase from "../../useCase/chat.usecase";
import { ErrorMessage } from "../../domain/enum/error.enum";

class ChatController {
  

  constructor(private ChatUseCase: ChatUsecase) {    
  }
  
  async CheckForRoomID(req: Request, res: Response): Promise<void> {
    
        try {
          const response = await this.ChatUseCase.CheckForRoomID(req);
          res.status(response.status).send(response.data.data);
        } catch (error) {
          res.status(500).send({
            success: true,
            message: ErrorMessage.ServerError,
          });
        }
      }
    
      async CheckForRoomIDM(req: Request, res: Response): Promise<void> {
    
        try {
          
          const response = await this.ChatUseCase.CheckForRoomIDM(req);
          res.status(response.status).send(response.data.data);
        } catch (error) {
          res.status(500).send({
            success: true,
            message: ErrorMessage.ServerError,
          });
        }
      }
    

 
      
  async StoreChatMessage(req: Request, res: Response): Promise<void> {
    
    try {
      const response = await this.ChatUseCase.StoreChatMessage(req);
      res.status(response.status).send(response.data.data);
    } catch (error) {
      res.status(500).send({
        success: true,
        message: ErrorMessage.ServerError,
      });
    }
  }

}

export default ChatController;