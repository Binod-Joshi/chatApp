const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();
const PORT = process.env.PORT || 5000;

dotenv.config();
app.use(express.json({ limit: "10mb" }));

// CORS configuration
app.use(
  cors({
    origin: "https://uniquechatting.netlify.app", // Replace with your frontend's URL
    credentials: true, // Allow credentials such as cookies, authorization headers
  })
);

mongoose
  .connect(process.env.MONGO_URL1, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const chatRoute = require("./routes/chat");
const messageRoute = require("./routes/messsage");
const notificationRoute = require("./routes/notification");

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);
app.use("/api/notification", notificationRoute);

// Custom error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000, // Disconnect the connection after 60 seconds to save bandwidth
  cors: {
    origin: "https://main--uniquechatting.netlify.app", // Replace with your frontend's URL
    methods: ["GET", "POST"], // Allowed methods for CORS requests
    allowedHeaders: ["my-custom-header"], // Specify any custom headers to allow
    credentials: true, // Allow credentials such as cookies, authorization headers
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // Connected to user personal socket
  socket.on("setup", (userData) => {
    socket.join(userData?._id);
    socket.emit("connected");
  });

  // For a particular room (a particular chat id)
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  // For sending a message
  socket.on("new message", (newMessageReceived) => {
    let chat = newMessageReceived?.chat;

    if (!chat?.users) {
      return console.log("chat.users not found");
    }

    // Logic for sending a message to all other users in a chat (one-to-one or group chat)
    // but not to the user who sends the message.
    chat.users.forEach((user) => {
      if (user?._id == newMessageReceived?.sender?._id) return;

      // In the user's room, emit/send that message
      socket.in(user?._id).emit("message received", newMessageReceived);
    });
  });

  // To clean up the socket to save bandwidth
  socket.on("disconnect", () => {
    console.log("User disconnected");
    socket.leaveAll();
  });
});
