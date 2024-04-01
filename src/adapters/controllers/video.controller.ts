import { Request, Response } from "express";
import { ErrorMessage } from "../../domain/enum/error.enum";
import StudentUsecase from "../../useCase/student.usecase";
import { HttpStatus } from "../../domain/enum/httpStatus.enum";



class VideoController { 

    constructor() {    
    }
 
    async NotifyOnline(req: Request, res: Response): Promise<void> {

        const studentID = req.headers.studentID;

        
        res.sendStatus(HttpStatus.Success).send('success');
        try {
        } catch (error) {
          res.status(500).send({
            success: true,
            message: ErrorMessage.ServerError,
          });
        }
      }
    
 
}
export default VideoController;