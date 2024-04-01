

import mongoose from "mongoose";
import { IRank, IRanklist } from "../../../domain/models/rank";


 const RankListSchema = new mongoose.Schema<IRanklist>({
    rank: { type: Number, required: true },
    name: { type: String, required: true },
    student_id: { type: String, required: true },
    mark: { type: Number, required: true },
  });

 const RankSchema = new mongoose.Schema<IRank>({ 
  todoid: {
    type: String,
    required : true
    },
  ranklist : {
      type: [RankListSchema],
      required : true
      },
  },
);

export const Rank = mongoose.model("Rank", RankSchema);

export const RankList = mongoose.model("RankList", RankListSchema);

