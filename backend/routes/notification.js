const router = require("express").Router();
const {jwtProtect} = require("../middleware/authMiddleware");
const Notification = require("../models/NotificationMode")

// sending notification from frontend and saves in backend.
router.post("/",jwtProtect,async(req,res) => {
    try {
        const {newNotification} = req.body;
        let notification = {
            sender:newNotification.sender,
            content:newNotification.content,
            chat:newNotification.chat,
        }
        let data = await Notification.create(notification);
        res.json(data)
    } catch (error) {
        
    }
})

module.exports = router;