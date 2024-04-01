
import mongoose from "mongoose";
import { IOTP } from "../../../domain/models/otp";

const OtpSchema=new mongoose.Schema<IOTP>({
    email:{
        type:String,
        required:true
    },
    otp:{
        type:String,
        required:true
    }
})

const OTP=mongoose.model("Otp",OtpSchema)

export default OTP