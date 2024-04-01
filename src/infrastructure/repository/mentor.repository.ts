import { ErrorMessage } from "../../domain/enum/error.enum";
import IBook from "../../domain/models/book";
import IMentor from "../../domain/models/mentor";
import IMentorBody from "../../domain/models/mentorBody";
import ITodo from "../../domain/models/todo";
import Book from "../db/models/book.model";
import Mentors from "../db/models/mentor.model";
import Todo from "../db/models/todo.model";

class MentorRepository {
  async mentorList() {
    try {
      const mentors = await Mentors.find(
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
        message: "All Mentors fetched",
        data: mentors,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async findMentor(id: string) {
    try {
      const MentorDetails = await Mentors.findById(id, { password: 0 });
      if (!MentorDetails) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Mentor details fetched",
        data: MentorDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async authenticateMentor(email: string) {
    try {
      const MentorDetails = await Mentors.findOne({ email: email });
      if (!MentorDetails) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Mentor details fetched",
        data: MentorDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async signupMentor(details: IMentorBody) {
    try {
      const mentorDetails = await Mentors.create(details);
      if (!mentorDetails) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Mentor details fetched",
        data: {
          id: mentorDetails._id,
          email: mentorDetails.email,
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
      const Details = await Mentors.updateOne(
        { email: email },
        { verified: true }
      );
      if (!Details) {
        return {
          success: true,
          message: " Mentor status not updated",
        };
      }
      return {
        success: true,
        message: "Mentor verified",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async findmentor(mentorID: string) {
    try {
      const mentorDetails = await Mentors.findById(mentorID, {
        password: 0,
        confirmpassword: 0,
      });
      if (!mentorDetails) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "mentor details fetched",
        data: mentorDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async editmentor(details: any) {
    try {
      const Details = await Mentors.updateOne(
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

      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      const MentorDetails = await Mentors.findOne({ email: details.email });

      return {
        success: true,
        message: "Details updated",
        data: MentorDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async deletementor(id: string) {
    try {
      const mentorDetails = await Mentors.deleteOne({ _id: Object(id) });

      if (!mentorDetails) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "mentor deleted successfully",
        data: mentorDetails,
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
      const Details = await Mentors.updateOne(
        { email: email },
        { $set: { password: password } }
      );

      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
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

  async accesschange(id: string) {
    try {
      const Details = await Mentors.findOneAndUpdate({ _id: id }, [
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
        message: "Mentor access changed",
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
      const Details = await Mentors.findByIdAndUpdate(id, {
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
        message: "Mentor Image changed",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async getMentorsbycount(skip: number, limit: number) {
    try {
      const mentors = await Mentors.find().skip(skip).limit(limit);
      return {
        success: true,
        message: "Mentor data fetched",
        data: mentors,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async getMentorcount() {
    try {
      const count = await Mentors.countDocuments();
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

  async ChangePassword(password: string, mentorID: string) {
    try {
      const MentorDetails = await Mentors.findByIdAndUpdate(mentorID, {
        password: password,
      });

      if (!MentorDetails) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Password Updated",
        data: MentorDetails,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update ${error}`,
      };
    }
  }

  async uploadBookDetails(details: IBook) {
    try {
      const Details = await Book.create(details);

      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }
      return {
        success: true,
        message: "Book uploaded",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch ${error}`,
      };
    }
  }

  async uploadToDo(details: ITodo) {
    try {
      const Details = await Todo.create(details);
      if (!Details) {
        return {
          success: true,
          message: ErrorMessage.NotFound
        };
      }

      return {
        success: true,
        message: "ToDo upDated",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to upload ${error}`,
      };
    }
  }

  async GetCurrentBook() {
    try {
      const Details = await Book.find().sort({ _id: -1 }).limit(1);

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }

      return {
        success: true,
        message: "Current book fetched",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Current book ${error}`,
      };
    }
  }

  async CheckDate() {
    try {
      const Details = await Todo.find({
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      });

      if (!Details || Details.length == 0) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }

      return {
        success: true,
        message: "Date is allotted",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Date details ${error}`,
      };
    }
  }

  async CheckDateBook() {
    try {
      const Details = await Book.find({
        shared_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      });

      if (!Details || Details.length == 0) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }

      return {
        success: true,
        message: "Date is allotted",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Date details ${error}`,
      };
    }
  }
}

export default MentorRepository;
