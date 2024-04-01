import { Server } from "socket.io";
import IChat from "../../domain/models/chat";

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

const onlineStudents = new Map();

let mentorSocketID: string | string[] | null= null;
let studentSocketID : string='';
function intializeSocket(server: any) {
  const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:4200",
    },
  });

  io.on("connection", (socket: any) => {
    console.log("A User connected", socket.id, socket.handshake.time);

    socket.on("join", (studentID: string) => {
      console.log("JOining....", studentID);
      // io.emit("online", studentID);
      socket.join(studentID);
      socket.emit("connected");
      socket.broadcast.emit("online", studentID);
    });

    socket.on("mentorjoin", (mentorID: string) => {
      console.log("JOining mentor....", mentorID);
      // io.emit("online", studentID);
      socket.join(mentorID);
      socket.emit("connected");
      socket.broadcast.emit("mentoronline", mentorID);
    });

    socket.on("leave", (studentID: string) => {
      console.log("leaving.....");
      socket.leave(studentID);
    });

    socket.on("msg", (message: IChat) => {
      console.log("MSG SEVER", message);
      // io.emit("msg", message);
      socket.to(message.roomid).emit("from", message);

      socket.broadcast.emit("msg", message);
    }),
      socket.on("disconnect", () => {
        console.log("student disconnected");
      });

    // notification

    socket.on("joinNotifications", (data: any) => {
      socket.join(data);
      console.log(data, "joined notif");
    });

    socket.on("notification", (data: { receiverID: string; type: string }) => {
      io.to(data.receiverID).emit("new notification", data.type);
      console.log("notificaion to new ", data);
    });

    socket.on("leaveNotifications", (data: any) => {
      socket.leave(data);
      console.log(data, "left notif");
    });

    // video starts here\\\\\

    // again

   
    //mentor joining the room
    socket.on("room:join", (data: any) => {
      console.log(`mentor ${data.name} joined room ${data.room} and socket is `, socket.id);
      const { name, room } = data;
      mentorSocketID=socket.id;
      // console.log("mentor ", name, room);

      emailToSocketIdMap.set(name, socket.id);
      socketIdToEmailMap.set(socket.id, name);
      socket.join(room);
      // roomSockets = io.sockets.adapter.rooms.get(room)
      // io.to(socket.id).emit("room:join", data);
    });

     // Student is online with a name
     socket.on('student:online', (studentName: string) => {
      onlineStudents.set(socket.id, { name: studentName, socketId: socket.id });
      console.log(`Student ${studentName} is online with socket id as ${socket.id}`);
      studentSocketID=socket.id;
      if (mentorSocketID) {
        io.to(mentorSocketID).emit('mentor:studentOnline', {name:studentName, socketID : socket.id});
    }
  });
  socket.on('student:joinRoom', ( data: {name : string,room : string}) => {

    let room = data.room;
    console.log(data, " test ", room, " kk", data.name,  data.room);
    
    // Find the student's socket ID based on their name
        // Emit a 'student:joinroom' event to the student's socket
        socket.join(room);
        io.to(room).emit('student:joined',studentSocketID);
        // // io.to(data.socketId).emit('data:joinroom', room);
        console.log(`Mentor requested student ${data.name} to join room ${room}`);
    });


    socket.on("studentonline", (data: string) => {
      console.log("st onlin ", data, socket.id);
      onlineStudents.set(socket.id, { name: data, socketId: socket.id });
       
      socket.emit("student:online", data);
    });

    //student joining the room
    socket.on("student-room:join", (data: any) => {
      console.log(`student ${data.name} joined room ${data.room}`, socket.id);
      const { name, room } = data;
      socket.join(room);
      io.to(room).emit("student:joined", socket.id);
    });
    //listening to call emitted by mentor
    socket.on("student:call", ({ to, offer }: { to: string; offer: any }) => {
      console.log(`mentor ${socket.id} initiated a call to ${to}`, offer);
      //emitting the incoming call event to student
      io.to(to).emit("incoming:call", { from: socket.id, offer });
    });

    //listening to the call:accepted event
    socket.on("call:accepted", (data: any) => {
      // console.log(data,42222222222)
      // console.log(data.to,43333);
      // console.log(Object.values(data: any)[0].ans,44444);
      console.log(`Call accepted from ${(Object.values(data)as any)[0].to} to ${socket.id} and answer is ${(Object.values(data)as any)[0].ans }`);
      const { to, ans } = data;
      //emitting call:accepted event
      io.to((Object.values(data) as any)[0].to).emit("call:accepted", {
        from: socket.id,
        ans: (Object.values(data) as any)[0].ans,
      });
    });

    //listening to negotiation needed
    socket.on("peer:nego:needed", (data: any) => {
      const { to, offer } = data;
      io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    //listening  nego:done
    socket.on("peer:nego:done", (data: any) => {
      const { to, ans } = data;
      io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    });

    // Handle socket disconnection
    socket.on("disconnect:call", (data: any) => {
      console.log(data, 6666);
      const { to } = data;
      console.log(to, 6888);
      console.log(socketIdToEmailMap, 6999);
      console.log(emailToSocketIdMap, 7000);
      const email = socketIdToEmailMap.get(to);
      console.log(email, 7000);
      if (email) {
        emailToSocketIdMap.delete(email);
        socketIdToEmailMap.delete(to);
        console.log(emailToSocketIdMap, 766);
        console.log(socketIdToEmailMap, 777);
      }
      // Emit disconnect event to notify the other party
      //  console.log(roomSockets,7666);
      const targetSocket = io.sockets.sockets.get(to);
      if (targetSocket) {
        targetSocket.disconnect();
      }
    });

    // instrument(io, { auth: false })

    // again ends here

    //  // mentor
    //  socket.on("onlinementor", (data: string) => {
    //   console.log("Received from clientMentor:", data);
    //   socket.broadcast.emit("onlinementor", data);
    // });

    // // student
    // socket.on("onlinestudent", (data: string) => {
    //   console.log("Received from clientstudent:", data);
    //   socket.broadcast.emit("onlinestudent", data);
    // });

    // socket.on("mentor:online", (data: string) => {
    //   console.log("Received from client:", data);
    //   socket.emit("online", data);
    // });

    // // Mentor joining
    // socket.on("mentor-room:join", (data: any) => {
    //   console.log(data, "mentor-room:join$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$");
    //   const { email, room } = data;
    //   emailToSocketIdMap.set(email, socket.id);
    //   socketIdToEmailMap.set(socket.id, email);
    //   console.log("room ", room, socket.id);
    //   socket.join(room); // Room join
    // });

    // // student joining to the room
    // socket.on("student-room:join", (data: any) => {
    //   const { email, room } = data;
    //   // console.log(`student ${data.email} joined room ${data.room}`);
    //   socket.join(room);
    //   io.to(room).emit("student:joined", socket.id);
    // });

    // // Mentor call to student
    // socket.on(
    //   "student:call",
    //   ({ to, offer }: { to: string; offer: string }) => {
    //     // console.log(`Mentor ${socket.id} initiated a call to ${to}`);
    //     io.to(to).emit("incoming:call", { from: socket.id, offer });
    //   }
    // );

    // // Call accepting
    // socket.on("call:accepted", (data: any) => {
    //   // console.log(Object.values(data)[0].ans, 'Data in the call:accept event');
    //   io.to((Object.values(data)[0] as any).to).emit("call:accepted", {
    //     from: socket.id,
    //     ans: (Object.values(data) as any)[0].ans,
    //   });
    // });

    // // Peer negotiation needed
    // socket.on("peer:nego:needed", (data: any) => {
    //   const { to, offer } = data;
    //   io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    // });

    // // Peer negotiation done
    // socket.on("peer:nego:done", (data: any) => {
    //   const { to, ans } = data;
    //   io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    // });

    // // Disconnect call
    // socket.on("disconnect:call", (data: any) => {
    //   const { to } = data;
    //   const email = socketIdToEmailMap.get(to);

    //   if (email) {
    //     emailToSocketIdMap.delete(email);
    //     socketIdToEmailMap.delete(to);
    //   }

    //   const targetSocket = io.sockets.sockets.get(to);
    //   if (targetSocket) {
    //     targetSocket.disconnect();
    //   }

    //   // ***
    //     socket.on("online", (data: string) => {
    //       console.log("Received from client:", data);
    //       socket.emit("online", data);
    //     });

    //     // test
    //     socket.on("test", (data: any) => {
    //       console.log("Received from client:", data);
    //       socket.emit("test", "Hello from server");
    //     });

    //     //  codes

    //     console.log(`Socket connected: ${socket.id}`);

    //     //mentor joining the room
    //     socket.on("room:join", (data: any) => {
    //       console.log(`Mentor ${data.email} joined room ${data.room}`);
    //       const { email, room } = data;
    //       emailToSocketIdMap.set(email, socket.id);
    //       socketIdToEmailMap.set(socket.id, email);
    //       socket.join(room);
    //       let roomSockets = io.sockets.adapter.rooms.get(room);
    //       // io.to(socket.id).emit("room:join", data);
    //     });
    //     //student joining the room
    //     socket.on("student-room:join", (data: any) => {
    //       console.log(`student ${data.email} joined room ${data.room}`);
    //       const { email, room } = data;
    //       socket.join(room);
    //       io.to(room).emit("student:joined", socket.id);
    //     });
    //     //listening to call emitted by mentor
    //     socket.on("student:call", ({ to, offer }: { to: string; offer: any }) => {
    //       console.log(`Mentor ${socket.id} initiated a call to ${to}`);
    //       //emitting the incoming call event to student
    //       io.to(to).emit("incoming:call", { from: socket.id, offer });
    //     });

    //     //listening to the call:accepted event
    //     socket.on("call:accepted", (data: { to: string; ans: any }) => {
    //       // console.log(data,42222222222)
    //       // console.log(data.to,43333);
    //       //   console.log(Object.values(data)[0].ans,44444);
    //       // console.log(`Call accepted from ${Object.values(data)[0].to} to ${socket.id} and answer is ${Object.values(data)[0].ans }`);
    //       const { to, ans } = data;
    //       //emitting call:accepted event
    //       io.to(Object.values(data)[0].to).emit("call:accepted", {
    //         from: socket.id,
    //         ans: Object.values(data)[0].ans,
    //       });
    //     });

    //     //listening to negotiation needed
    //     socket.on("peer:nego:needed", (data: any) => {
    //       const { to, offer } = data;
    //       io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    //     });

    //     //listening  nego:done
    //     socket.on("peer:nego:done", (data: any) => {
    //       const { to, ans } = data;
    //       io.to(to).emit("peer:nego:final", { from: socket.id, ans });
    //     });

    //     // Handle socket disconnection
    //     socket.on("disconnect:call", (data: any) => {
    //       // console.log(data,6666);
    //       const { to } = data;
    //       // console.log(to,6888);
    //       // console.log(socketIdToEmailMap,6999);
    //       // console.log(emailToSocketIdMap,7000);
    //       const email = socketIdToEmailMap.get(to);
    //       // console.log(email,7000);
    //       if (email) {
    //         emailToSocketIdMap.delete(email);
    //         socketIdToEmailMap.delete(to);
    //         // console.log(emailToSocketIdMap,766);
    //         // console.log(socketIdToEmailMap,777);
    //       }
    //       // Emit disconnect event to notify the other party
    //       //  console.log(roomSockets,7666);
    //       const targetSocket = io.sockets.sockets.get(to);
    //       if (targetSocket) {
    //         targetSocket.disconnect();
    //       }

    //     });
    //   });
  });
}

export default intializeSocket;
