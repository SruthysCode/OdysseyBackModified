import { ErrorMessage } from "../../domain/enum/error.enum";
import IStudent from "../../domain/models/student";
import IStudentBody from "../../domain/models/studentBody";
import Students from "../db/models/student.model";

const { ObjectId } = require("mongodb");

class StudentRepository {
  async getStudents(role: string, regex: string) {
    try {
      const students = regex
        ? await Students.find(
            { role: role, email: { $regex: regex } },
            { password: 0 }
          )
        : await Students.find({ role: role }, { password: 0 });
      return {
        success: true,
        message: "All Students fetched",
        data: Students,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async studentList() {
    try {
      const students = await Students.find(
        {},
        {
          _id: 1,
          name: 1,
          email: 1,
          address: 1,
          mobile: 1,
          blocked: 1,
          avatar: 1,
        }
      );
      return {
        success: true,
        message: "All students fetched",
        data: students,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async findStudent(StudentId: string) {
    try {
      const StudentDetails = await Students.findById(StudentId);
      if (!StudentDetails) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Student details fetched",
        data: StudentDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async authenticateStudent(email: string) {
    try {
      const StudentDetails = await Students.findOne({ email: email });
      if (!StudentDetails) {
        return {
          success: true,
          message: "No Student found",
        };
      }
      return {
        success: true,
        message: "Student details fetched",
        data: StudentDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async signupStudent(details: IStudentBody) {
    try {
      const userDetails = await Students.create(details);
      if (!userDetails) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "user details fetched",
        data: {
          id: userDetails._id,
          email: userDetails.email,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async updateStatus(email: string) {
    try {
      const StudentDetails = await Students.updateOne(
        { email: email },
        { verified: true }
      );
      if (!StudentDetails) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Student verified",
        data: StudentDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async editprofile(details: any, email: string) {
    try {
      const StudentDetails = await Students.updateOne(
        { email: details.email },
        {
          $set: {
            name: details.name,
            address: details.address,
            mobile: details.mobile,
            // avatar: details.avatar,
          },
        },
        { upsert: true }
      );

      if (!StudentDetails) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      const Details = await Students.findOne({ email: details.email });
      return {
        success: true,
        message: "Student verified",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async deletestudent(id: string) {
    try {
      const studentDetails = await Students.deleteOne({ _id: Object(id) });

      if (!studentDetails) {
        return {
          success: false,
          message:ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "student deleted successfully",
        data: studentDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async passwordchange(email: string, password: string) {
    try {
      const StudentDetails = await Students.updateOne(
        { email: email },
        { $set: { password: password } }
      );

      if (!StudentDetails) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      if (StudentDetails.matchedCount == 0) {
        return {
          success: false,
          message: "Student not found!!",
        };
      }
      return {
        success: true,
        message: "Student verified",
        data: StudentDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async accesschange(id: string) {
    try {
      const Details = await Students.findOneAndUpdate({ _id: id }, [
        { $set: { blocked: { $eq: [false, "$blocked"] } } },
      ]);
      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Student access changed",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async updateImgDetails(id: string, imagePath: string) {
    try {
      const Details = await Students.findByIdAndUpdate(id, {
        avatar: imagePath,
      });
      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Student Image changed",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async getStudentsbycount(skip: number, limit: number) {
    try {
      const students = await Students.find().skip(skip).limit(limit);
      return {
        success: true,
        message: "Student data fetched",
        data: students,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async getStudentcount() {
    try {
      const count = await Students.countDocuments();
      return {
        success: true,
        data: count,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async ChangePassword(password: string, studentID: string) {
    try {
      const StudentDetails = await Students.findByIdAndUpdate(studentID, {
        password: password,
      });

      if (!StudentDetails) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Password Updated",
        data: StudentDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update ${error}`,
      };
    }
  }

  async UpdateNotification( studentID: string, type : string) {
    try {
      const Details =await Students.findOneAndUpdate(
        { _id: studentID },
        { $push: { notification: { type, read: false } } },
        { new: true }
      )

      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Password Updated",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update ${error}`,
      };
    }
  }

  
  async GetNotifications( studentID: string) {
    try {
      const Details =await Students.find(
        { _id: studentID, "notification.read": false },
  { "notification.$": 1 }
      )

      console.log("not", Details);
      
      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Password Updated",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update ${error}`,
      };
    }
  }

  
  async UpdateNotifications( studentID: string) {
    try {
      const Details =await Students.updateOne(
        { _id: studentID },
        { $set: { 'notification.$[].read': true } }
      );
      console.log("not", Details);
      
      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Password Updated",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update ${error}`,
      };
    }
  }

}

export default StudentRepository;
