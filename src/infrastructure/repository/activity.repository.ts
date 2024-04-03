import { errorMonitor } from "nodemailer/lib/xoauth2";
import { ErrorMessage } from "../../domain/enum/error.enum";
import IActivity from "../../domain/models/activity";
import { IRank } from "../../domain/models/rank";
import IToDo from "../../domain/models/todo";
import Activity from "../db/models/activity.model";
import Book from "../db/models/book.model";
import { Rank } from "../db/models/rank.model";
import Todo from "../db/models/todo.model";
import Student from "../db/models/student.model";
import { ObjectId } from "mongoose";

// const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

class ActivityRepository {
  async CheckDate() {
    try {
      const Details = await Todo.find({
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      });

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
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

  async CurrentActivity() {
    try {
      const Details = await Todo.find({
        start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      })
        .sort({ end_date: -1 })
        .limit(1);

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Activity is allotted",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Activity details ${error}`,
      };
    }
  }

  async PostActivity(details: IActivity) {
    try {
      const Details = await Activity.create(details);

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Activity is allotted",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Activity details ${error}`,
      };
    }
  }

  async CheckActivity(activityID: string, studentID: string) {
    try {
      const Details = await Activity.find({
        todo_id: activityID,
        student_id: studentID,
      });

      if (!Details || Details.length == 0) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Activity is Submitted",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Activity submitted details ${error}`,
      };
    }
  }

  async Activities(studentID: string) {
    try {
      const Details = await Activity.aggregate(
        [
          {
            $match: {
              student_id: studentID,
            },
          },
          {
            $lookup: {
              from: "todos",
              let: {
                todoid: {
                  $toObjectId: "$todo_id",
                },
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$todoid"],
                    },
                  },
                },
              ],
              as: "todo",
            },
          },
          {
            $unwind: {
              path: "$todo",
            },
          },
          {
            $lookup: {
              from: "books",
              let: {
                bookid: {
                  $toObjectId: "$todo.book_id",
                },
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$bookid"],
                    },
                  },
                },
              ],
              as: "book",
            },
          },
          {
            $unwind: {
              path: "$book",
            },
          },
          {
            $set: {
              bookname: "$book.title",
              todoname: "$todo.todo_name",
            },
          },
          {
            $project: {
              _id: 1,
              activity_link: 1,
              submitted_date: 1,
              todoname: 1,
              bookname: 1,
            },
          },
        ]

        // [
        //   {
        //     '$match': {
        //       'student_id': studentID
        //     }
        //   }, {
        //     '$lookup': {
        //       'from': 'todos',
        //       'localField': 'activities.todo_id',
        //       'foreignField': 'todos._id',
        //       'as': 'todo'
        //     }
        //   }, {
        //     '$unwind': {
        //       'path': '$todo'
        //     }
        //   }, {
        //     '$lookup': {
        //       'from': 'books',
        //       'localField': 'book_id',
        //       'foreignField': 'books._id',
        //       'as': 'book'
        //     }
        //   }, {
        //     '$unwind': {
        //       'path': '$book'
        //     }
        //   }, {
        //     '$project': {
        //       'activity_link': 1,
        //       'submitted_date': 1,
        //       'todoname': '$todo.todo_name',
        //       'bookname': '$book.title'
        //     }
        //   }, {
        //     '$sort': {
        //       'submitted_date': -1
        //     }
        //   }
        // ]
      );
      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Activities is Available",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Activities details ${error}`,
      };
    }
  }

  async Blog() {
    try {
      const Details = await Activity.aggregate([
        {
          $sort: {
            submitted_date: -1,
          },
        },
        {
          $lookup: {
            from: "todos",
            let: {
              todoid: {
                $toObjectId: "$todo_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$todoid"],
                  },
                },
              },
            ],
            as: "todo",
          },
        },
        {
          $unwind: {
            path: "$todo",
          },
        },
        {
          $lookup: {
            from: "students",
            let: {
              studentid: {
                $toObjectId: "$student_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$studentid"],
                  },
                },
              },
            ],
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
          },
        },
        {
          $lookup: {
            from: "books",
            let: {
              bookid: {
                $toObjectId: "$todo.book_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$bookid"],
                  },
                },
              },
            ],
            as: "book",
          },
        },
        {
          $unwind: {
            path: "$book",
          },
        },
        {
          $set: {
            todoname: "$todo.todo_name",
            studentname: "$student.name",
            booktitle: "$book.title",
          },
        },
        {
          $project: {
            _id: 1,
            activity_link: 1,
            submitted_date: 1,
            todoname: 1,
            studentname: 1,
            booktitle: 1,
            blocked: 1,
            mark: 1,
            likes: 1,
            comments: 1,
          },
        },
      ]);

      // [
      //   {
      //     '$lookup': {
      //       'from': 'todos',
      //       'localField': 'activities.todo_id',
      //       'foreignField': 'todos._id',
      //       'as': 'todo'
      //     }
      //   }, {
      //     '$unwind': {
      //       'path': '$todo'
      //     }
      //   }, {
      //     '$lookup': {
      //       'from': 'students',
      //       'localField': 'activities.student_id',
      //       'foreignField': 'students._id',
      //       'as': 'student'
      //     }
      //   },
      //   {
      //     '$unwind': {
      //       'path': '$student'
      //     }
      //   }, {
      //     '$lookup': {
      //       'from': 'books',
      //       'localField': 'activities.book_id',
      //       'foreignField': 'books._id',
      //       'as': 'book'
      //     }
      //   }, {
      //     '$unwind': {
      //       'path': '$book'
      //     }
      //   }, {
      //     '$project': {
      //       'activity_name': '$todo.todo_name',
      //       'activity_link': '$todo.link',
      //       'studentname': '$student.name',
      //       'bookname': '$book.title',
      //       'submitted_date': '$submitted_date'
      //     }
      //   },
      //   {
      //     $group: {
      //       _id: "$_id",
      //       activity_name: { $first: "$activity_name" },
      //       activity_link: { $first: "$activity_link" },
      //       student_name: { $first: "$studentname" },
      //       book_name: { $first: "$bookname" },
      //       submitted_date: { $first: "$submitted_date" }
      //     }
      //   }
      // ])

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Blog details is Available",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Blog details ${error}`,
      };
    }
  }

  async Books() {
    try {
      const Details = await Book.find().sort({ shared_date: -1 }).limit(4);
      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Books details fetched",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Book details ${error}`,
      };
    }
  }

  async Block(id: string) {
    try {
      const Details = await Activity.findOneAndUpdate({ _id: id }, [
        { $set: { blocked: true } },
      ]);

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Books details fetched",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Book details ${error}`,
      };
    }
  }

  async UnBlock(id: string) {
    try {
      const Details = await Activity.findOneAndUpdate({ _id: id }, [
        { $set: { blocked: false } },
      ]);

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Books details fetched",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Book details ${error}`,
      };
    }
  }

  async GetActivities(id: string) {
    try {
      const Details = await Activity.find();

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Books details fetched",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Book details ${error}`,
      };
    }
  }

  async GetActivityForMarks() {
    try {
      const Details = await Activity.aggregate([
        {
          $match: {
            mark: 0,
          },
        },
        {
          $sort: {
            submitted_date: -1,
          },
        },
        {
          $lookup: {
            from: "todos",
            let: {
              todoid: {
                $toObjectId: "$todo_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$todoid"],
                  },
                },
              },
            ],
            as: "todo",
          },
        },
        {
          $unwind: {
            path: "$todo",
          },
        },
        {
          $lookup: {
            from: "students",
            let: {
              studentid: {
                $toObjectId: "$student_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$studentid"],
                  },
                },
              },
            ],
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
          },
        },
        {
          $lookup: {
            from: "books",
            let: {
              bookid: {
                $toObjectId: "$todo.book_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$bookid"],
                  },
                },
              },
            ],
            as: "book",
          },
        },
        {
          $unwind: {
            path: "$book",
          },
        },
        {
          $set: {
            todoname: "$todo.todo_name",
            studentname: "$student.name",
            booktitle: "$book.title",
          },
        },
        {
          $project: {
            _id: 1,
            activity_link: 1,
            submitted_date: 1,
            todoname: 1,
            studentname: 1,
            booktitle: 1,
            blocked: 1,
            mark: 1,
          },
        },
      ]);

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Activities for Mark is Available",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Activities for Mark details ${error}`,
      };
    }
  }

  async UpdateMark(activityID: string, mark: number) {
    try {
      const Details = await Activity.findByIdAndUpdate(activityID, [
        { $set: { mark: Number(mark) } },
      ]);
      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }
      return {
        success: true,
        message: "Mark updated",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update Mark ${error}`,
      };
    }
  }

  async CheckTimeRank() {
    try {
      const Details = await Todo.find({
        // start_date: { $lte: new Date() },
        end_date: { $gte: new Date() },
      });

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
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

  async GetRankList(todoID : string) {
    try {
      const A = await Activity.aggregate([
        {
          $match: {
            todo_id: todoID,
          },
        },
        {
          $lookup: {
            from: "students",
            let: {
              studentid: {
                $toObjectId: "$student_id",
              },
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$_id", "$$studentid"],
                  },
                },
              },
            ],
            as: "student",
          },
        },
        {
          $unwind: {
            path: "$student",
          },
        },
        {
          $sort: {
            mark: -1,
          },
        },
        {
          $group: {
            _id: null,
            data: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $unwind: {
            path: "$data",
            includeArrayIndex: "index",
          },
        },
        {
          $addFields: {
            rank: {
              $add: ["$index", 1],
            },
          },
        },
        {
          $replaceWith: {
            mark: "$data.mark",
            name: "$data.student.name",
            rank: "$rank",
            id: "$data.student._id",
          },
        },
      ]);

      const B = await Student.find({}, { _id: 1, name: 1 });

      console.log("A is : ", A, "B >>>> ", B);
      let maxRank = Math.max(...A.map((item) => item.rank), 0);
      const C = [...A];

      for (const b of B) {
        if (!C.every((c) => c.id !== b.id)) {
          maxRank++;
          C.push({ id: b.id, name: b.name, mark: 0, rank: maxRank });
        }
      }

      const uniqueRecords = C.filter(
        (value, index, self) =>
          index === self.findIndex((t) => t.id === value.id)
      );

      console.log("c is >>>>>>>", C);

      if (!A) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Date is allotted",
        data: uniqueRecords,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Date details ${error}`,
      };
    }
  }

  async GetRank() {
    try {
      const activityID = await Todo.aggregate([
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: [
                    {
                      $dayOfMonth: "$end_date",
                    },
                    {
                      $dayOfMonth: new Date(),
                    },
                  ],
                },
                {
                  $eq: [
                    {
                      $month: "$end_date",
                    },
                    {
                      $month: new Date(),
                    },
                  ],
                },
                {
                  $eq: [
                    {
                      $year: "$end_date",
                    },
                    {
                      $year: new Date(),
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 1,
          },
        },
      ]);

      if (!activityID) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      } else {
        const activityid = String(activityID[0]._id);
        const Details = await Activity.aggregate([
          {
            $match: {
              todo_id: activityid,
            },
          },
          {
            $lookup: {
              from: "students",
              let: {
                studentid: {
                  $toObjectId: "$student_id",
                },
              },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ["$_id", "$$studentid"],
                    },
                  },
                },
              ],
              as: "student",
            },
          },
          {
            $unwind: {
              path: "$student",
            },
          },
          {
            $sort: {
              mark: -1,
            },
          },
          {
            $set: {
              studentname: "$student.name",
            },
          },
          {
            $project: {
              studentname: 1,
              mark: 1,
              student_id: 1,
            },
          },
          {
            $group: {
              _id: null,
              data: {
                $push: "$$ROOT",
              },
            },
          },
          {
            $unwind: {
              path: "$data",
              includeArrayIndex: "index",
            },
          },
          {
            $addFields: {
              rank: {
                $add: ["$index", 1],
              },
            },
          },
          {
            $replaceWith: {
              mark: "$data.mark",
              name: "$data.studentname",
              rank: "$rank",
              studentid: "$data.student_id",
            },
          },
        ]);

        // ([
        //   {
        //     $match: {
        //       todo_id: activityid
        //     },
        //   },
        //   {
        //     $lookup: {
        //       from: "students",
        //       let: {
        //         studentid: {
        //           $toObjectId: "$student_id",
        //         },
        //       },
        //       pipeline: [
        //         {
        //           $match: {
        //             $expr: {
        //               $eq: ["$_id", "$$studentid"],
        //             },
        //           },
        //         },
        //       ],
        //       as: "student",
        //     },
        //   },
        //   {
        //     $unwind: {
        //       path: "$student",
        //     },
        //   },
        //   {
        //     $sort: {
        //       mark: -1,
        //     },
        //   },
        //   {
        //     $set: {
        //       studentname: "$student.name",
        //     },
        //   },
        //   {
        //     $project: {
        //       studentname: 1,
        //       mark: 1,
        //     },
        //   },
        // ]);

        console.log(activityID, activityid, "Ranklist , ", Details, activityid);

        // const rankData: IRank = {
        //   todoid: activityid,
        //   ranklist: Details,
        // };
        // console.log("Rans ", rankData);
        // console.log(await Rank.create(rankData));
        // const RankDetails = await Rank.create(rankData);
        // console.log("Rankdetails ", RankDetails);
        if (!Details) {
          return {
            success: false,
            message: ErrorMessage.NotFound,
          };
        }

        return {
          success: true,
          message: "Rank is allotted",
          data: Details,
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to update  Rank ${error}`,
      };
    }
  }

  async UpdateLikes(activityid: string, like: number) {
    try {
      const Details = await Activity.updateOne(
        { _id: activityid },
        { $set: { likes: like } }
      );

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
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

  async getDetails(activityID : string){
    try {
      const Details = await Activity.find({_id : activityID},{student_id:1})
console.log("act", Details[0])
      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Activity Fetched",
        data: Details[0],
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Activity details ${error}`,
      };
    }
  }

  
  async UpdateComment(activityID: string, comment: string, name: string) {
    try {
      const newComment = {
        name: name,
        comment: comment,
      };

      const Details = await Activity.findByIdAndUpdate(
        activityID,
        { $push: { comments: newComment } },
        { new: true }
      );

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
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

  async DisplayActivity() {
    try {
      const Details = await Todo.find({},{ todo_name : 1});
      

      if (!Details) {
        return {
          success: false,
          message: ErrorMessage.NotFound,
        };
      }

      return {
        success: true,
        message: "Activities fetched",
        data: Details,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch Activity details ${error}`,
      };
    }
  }

  
  async getActivitycount() {
    try {
      const count = await Todo.countDocuments();
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

  async getFinalRank() {
    try {
      const Details=  await Activity.aggregate(
    [
      {
        '$group': {
          '_id': '$student_id', 
          'totalScore': {
            '$sum': '$mark'
          }
        }
      }, {
        '$sort': {
          'totalScore': -1
        }
      }, {
        '$group': {
          '_id': null, 
          'rankings': {
            '$push': {
              'studentId': '$_id', 
              'totalScore': '$totalScore'
            }
          }
        }
      }, {
        '$unwind': {
          'path': '$rankings', 
          'includeArrayIndex': 'index'
        }
      }, {
        '$lookup': {
          'from': 'students', 
          'let': {
            'studentid': {
              '$toObjectId': '$rankings.studentId'
            }
          }, 
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$_id', '$$studentid'
                  ]
                }
              }
            }
          ], 
          'as': 'student'
        }
      }, {
        '$unwind': {
          'path': '$student'
        }
      }, {
        '$project': {
          'mark': '$rankings.totalScore', 
          'name': '$student.name', 
          'rank': {
            '$add': [
              '$index', 1
            ]
          }
        }
      }
    ]
  )
  if (!Details) {
    return {
      success: false,
      message: ErrorMessage.NotFound,
    };
  }

  return {
    success: true,
    message: "Final Rank fetched",
    data: Details,
  };
} catch (error) {
  return {
    success: false,
    message: `Failed to fetch Rank details ${error}`,
  };
}
}


async GetAllActivity(studentID: string) {
  try {
    const Details=  await Activity.aggregate([
      {
        '$match': {
          'student_id': studentID
        }
      }, {
        '$lookup': {
          'from': 'todos', 
          'let': {
            'todoid': {
              '$toObjectId': '$todo_id'
            }
          }, 
          'pipeline': [
            {
              '$match': {
                '$expr': {
                  '$eq': [
                    '$_id', '$$todoid'
                  ]
                }
              }
            }
          ], 
          'as': 'todo'
        }
      }, {
        '$unwind': {
          'path': '$todo'
        }
      }, {
        '$project': {
          'todo_id': 1, 
          'todoname': '$todo.todo_name'
        }
      }
    ]

)
if (!Details) {
  return {
    success: false,
    message: ErrorMessage.NotFound,
  };
}

return {
  success: true,
  message: "All Activity fetched",
  data: Details,
};
} catch (error) {
return {
  success: false,
  message: `Failed to fetch Activity details ${error}`,
};
}
}



}

export default ActivityRepository;
