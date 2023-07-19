const User = require('../models/User')
const bcrypt = require('bcrypt');
const router = require('express').Router()
const {jwtProtect} = require('../middleware/authMiddleware');
const { findByIdAndDelete } = require('../models/User');

//get all user after searching api . /api/users?search=binod
router.get("/",jwtProtect,async(req,res) => {
  try {
   const keyword = req.query.search?{
      $or: [
         {username:{$regex:req.query.search, $options:"i"}},
         {email:{$regex:req.query.search, $options:"i"}},
      ],
   }:{};
   const users = await User.find(keyword).find({_id: {$ne: req.user._id}});
   res.status(200).send(users);
  } catch (error) {
   res.status(500).send(error.message)
  }
})

// updating the user
router.put("/updating",jwtProtect,async(req,res) => {
   if(req.body.password){
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password,salt);
  }
  try {
  const updatedUser = await User.findByIdAndUpdate(req.user.id,{
      $set:req.body,
  },
  {new:true}
  );
  res.status(200).json(updatedUser);
  } catch (error) {
   
      res.status(500).json(error);
  }
})

// deleting the user
router.delete("/delete",jwtProtect,async(req,res) => {
   try {
      await findByIdAndDelete(req.user._id);
   } catch (error) {
      res.status(500).json(error);
   }
})


module.exports = router












// router.get("/user/:id", async (req, res) => {
//     let result = await User.findById(req.params.id)
//     res.send(result)
// })

// router.put("/user/:id", async (req, res) => {
//     if (req.body.password) {
//         const salt = await bcrypt.genSalt(10)
//         res.body.password = await bcrypt.hash(res.body.password, salt)
//     }
//     const result = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
//     res.send(result)
// })

// router.delete("/user/:id", async (req, res) => {
//     const result = await User.findByIdAndDelete(req.params.id)
//     res.send(result)
// })

// module.exports = router