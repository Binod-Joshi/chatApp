const router = require("express").Router();
const { jwtProtect } = require("../middleware/authMiddleware");
const Chat = require("../models/ChatMode");
const Message = require("../models/MessageMode");
const User = require("../models/User");

// for send messages
router.post("/", jwtProtect, async (req, res) => {
  const { content, chatId } = req.body;
  //here chatId mean id of chat weather it is a one to one chat or group chat
  if (!content || !chatId) {
    return res.sendStatus(400);
  }
  let newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
  };

  // to check chatId or group exist or not.
  let dataaa = await Chat.findById(chatId);
  if(dataaa){
    try {
      let message = await Message.create(newMessage);
      message = await message.populate("sender", "username profileDP");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "username profileDP email",
      });
  
      //for latestMessage
      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      });
      res.json(message);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }else{
    res.status(410).send("This group was deleted by a Admin.")
  }
 
});

//for getting all message of particular user  or group
router.get("/:chatId", jwtProtect, async (req, res) => {
  const { chatId } = req.params;
  let data = await Chat.findById(chatId);
  if(data){
    try {
      const messages = await Message.find({ chat: chatId })
        .populate("sender", "username profileDP email")
        .populate("chat");
      res.json(messages);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }else{
    res.json("This group was deleted by a Admin.");
  }
  
});

module.exports = router;
