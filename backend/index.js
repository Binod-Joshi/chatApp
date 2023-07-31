const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();

dotenv.config();
app.use(express.json({ limit: "10mb" }));
app.use(cors());

mongoose
  .connect(process.env.MONGO_URL1, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const chatRoute = require("./routes/chat");
const messageRoute = require("./routes/messsage");
const notificationRoute = require("./routes/notification")

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);
app.use("/api/notification",notificationRoute)

// Custom error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const server = app.listen(5000);

const io = require("socket.io")(server, {
  pingTimeout: 60000, // it means afeter 60 sec it disconnect the connnection to save bandwidth
  cors: {
    // used to prevent cors origin error
    origin: "https://main--uniquechatting.netlify.app",
  },
});

io.on("connection", (socket) => {
  console.log("connected to socket io");

  // connected to user personal socket
  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    socket.emit("connected");
  });

  // for particular room mean for particular chat id
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing",(room) => socket.in(room).emit("typing"));
  socket.on("stop typing",(room) => socket.in(room).emit("stop typing"));

  // for sending message
  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived?.chat;
    
    if (!chat?.users) return console.log("chat.users not found");

    // logic for sending a messsage to all other users in a chat(one to one or group chat)
    // but not to the user who send the message.
    chat.users.forEach(user => {
        if(user?._id == newMessageReceived?.sender?._id) return;

        // in means inside that user's room emit/send that message 
        socket.in(user?._id).emit("message received",newMessageReceived);
        
    });
  });

  // to clean off the socket to save bandwidth.
  socket.off("setup",() => {
    console.log("user disconnect");
    socket.leave(userData?._id);
  })
});
