import { ErrorMessage } from "../../domain/enum/error.enum";
import Admins from "../db/models/admin.model";

class AdminRepository {
  async authenticateAdmin(email: string) {
    try {
      const adminDetails = await Admins.findOne({ email: email });
      if (!adminDetails) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "admin details fetched",
        data: adminDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async adminprofile(data: string) {
    try {
      const id = data;
      const adminDetails = await Admins.findById(id, { password: 0 });
      if (!adminDetails) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "admin details fetched",
        data: adminDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }
}

export default AdminRepository;
