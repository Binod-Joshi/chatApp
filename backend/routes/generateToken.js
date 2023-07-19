const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn:'100h',
    })
}
module.exports = generateToken;