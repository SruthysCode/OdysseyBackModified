


import mongoose from "mongoose";
import IBook from "../../../domain/models/book";


const BookSchema = new mongoose.Schema<IBook>({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  link:{
    type: String,
    required : true,
  },
  
  shared_date: {
    type: Date,         
    },
  end_date: {
    type: Date,
    },
  shared_by: {
    type: Object,

  },
});

const Book = mongoose.model("Book", BookSchema);

export default Book;
