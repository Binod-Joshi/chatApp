const router = require('express').Router();
const bcrypt = require('bcrypt');
const generateToken = require('./generateToken');
const User = require("../models/User")

router.post("/register", async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPass = await bcrypt.hash(req.body.password, salt)
        
        let alreadyExistByEmail = await User.findOne({email:req.body.email});

        if(alreadyExistByEmail){
            res.json("user with this email already exist")
        }else{
            let user = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPass,
                profileDP: req.body.profileDP,
            })
            user = await user.save();
            // result.password = undefined;
            res.status(200).json({
                _id:user._id,
                username: user.username,
                email: user.email,
                profileDP: user.profileDP,
                token:generateToken(user._id),
            });
        }

    }
    catch (err) {
        res.status(500).json(err.message)
    }
})

router.post("/login", async (req, res) => {
    if (req.body.email && req.body.password) {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            const validated = await bcrypt.compare(req.body.password, user.password);
            if (validated) {
                // user.password = undefined
                res.send({
                    _id:user._id,
                    username: user.username,
                    email: user.email,
                    profileDP: user.profileDP,
                    token:generateToken(user._id)})
            } else {
                res.send({ result: "Invalid password" });
            }
        } else {
            res.send({ result: "User not found" });
        }
    } else {
        res.send({ result: "Email and password are required" });
    }
})


module.exports = router;