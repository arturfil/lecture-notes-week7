const bcrypt = require('bcryptjs');

const User = require('../models/User');
const { generateJwt } = require('../middlewares/generateJwt');

const userSignUp = async (req, res) => {
  const testEmail = await User.findOne({email: req.body.email});
  if (testEmail) {
    return res.status(500).json({message: "Email already exists"})
  }
  const userToCreate = await new User(req.body);
  try {
    const salt = bcrypt.genSaltSync();
    userToCreate.password = bcrypt.hashSync(req.body.password, salt);
    // 200 OK/Succesfull
    userToCreate.save();
    return res.status(201).json(userToCreate);
  } catch (error) {
    // 500 - Server error
    return res.status(500).json({message: "Couldn't create user"});
  }
}

const userLogin = async (req, res) => {
  const {email, password} = req.body; // instead of req.body.email ...

  const userToLogin = await User.findOne({email});
  if (!userToLogin) {
    // in production => "Wrong Credentials"
    return res.status(400).json({message: "User with that email doesn't exist"});
  }
  const validPassword = bcrypt.compareSync(password, userToLogin.password);
  if (!validPassword) {
    // In production, "Wrong credentials"
    return res.status(500).json({message: 'Incorrect Password'});
  }
  const token = await generateJwt(userToLogin._id);
  return res.json({user: userToLogin, token});
}

module.exports = {
  userSignUp,
  userLogin
}