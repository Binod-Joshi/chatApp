const router = require("express").Router();
const { jwtProtect } = require("../middleware/authMiddleware");
const Chat = require("../models/ChatMode");
const User = require("../models/User");
const Message = require("../models/MessageMode");

// to create the chat and check chat exist between two user or not
router.post("/", jwtProtect, async (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestmessage.sender",
    select: "username profileDP email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).send(fullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
});

// get all chats for a particular user
router.get("/", jwtProtect, async (req, res) => {
  try {
   Chat.find({ users: { $elemMatch: { $eq: req?.user?._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "username profileDP email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//for creation of group
router.post("/group", jwtProtect, async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res.status(200).send({ message: "Please fill all the fields" });
  }
  let users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than a two users are required to form a group");
  }
  users.push(req.user);
  try {
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).send(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

// for renaming of group
router.put("/rename", jwtProtect, async (req, res) => {
  const { chatId, chatName } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName,
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  if (!updatedChat) {
    res.status(400);
    throw new Error("chat not found");
  } else {
    res.json(updatedChat);
  }
});

// add to the group
router.put("/groupadd", jwtProtect, async (req, res) => {
  const { chatId, userId } = req.body;
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

    if (!added) {
        res.status(400);
        throw new Error("chat not found");
      } else {
        res.json(added);
      }
});

//  for groupremove means removefromgroup
router.put("/groupremove", jwtProtect, async (req, res) => {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
  
      if (!removed) {
          res.status(400);
          throw new Error("chat not found");
        } else {
          res.json(removed);
        }
});

//for deletion of group
router.delete("/groupdelete/:chatId", jwtProtect, async (req, res) => {
  const {chatId} = req.params;
      await Message.deleteMany({chat:chatId});
      await Chat.findByIdAndDelete({_id:chatId});
      res.status(200).send("successfully deleted");
})

module.exports = router;
