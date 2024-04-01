import { ErrorMessage } from "../../domain/enum/error.enum";
import IBook from "../../domain/models/book";
import Activity from "../db/models/activity.model";
import Book from "../db/models/book.model";
import Todo from "../db/models/todo.model";

const { ObjectId } = require("mongodb");

class BookRepository {
  async CheckDateBook() {
    try {
      const Details = await Book.find({
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      });

      if (!Details) {
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

  async CheckBook() {
    try {
      const Details = await Book.find({
        shared_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      })
        .sort({ end_date: -1 })
        .limit(1);

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound
        };
      }

      return {
        success: true,
        message: "Book is available",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Book details ${error}`,
      };
    }
  }

  
  async getBookcount() {
    try {
      const count = await Book.countDocuments();
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

  
}

export default BookRepository;
