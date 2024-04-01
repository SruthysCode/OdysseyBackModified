import { ErrorMessage } from "../../domain/enum/error.enum";
import { IOTP } from "../../domain/models/otp";
import OTP from "../db/models/otp.model";

class OtpRepository {
  async storeOtp(details: IOTP) {
    try {
      const otpDetails = await OTP.create(details);
      if (!otpDetails) {
        return {
          success: false,
          message:ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "OTP stored",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async checkOtp(details: IOTP) {
    try {
      const isAvail = await OTP.findOne(details);
      if (!isAvail) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "OTP matched",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  async deleteOtp(email: string) {
    try {
      await OTP.deleteMany({ email: email });
      return {
        success: true,
        message: "Removed all existing otp of given email",
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default OtpRepository;
