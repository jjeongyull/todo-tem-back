const bcrypt = require('bcryptjs');
const saltRounds = 10;
const User = require("../model/User");

const userController = {};

// 회원가입
userController.createUser = async (req, res) => {
  try{
    const {email, name, password} = req.body;
    const user = await User.findOne({email});
    if(user){
      throw new Error('이미 가입이 된 유저 입니다.');
    }
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    const newUser = new User({email, name, password:hash});
    await newUser.save();
    res.status(200).json({status: "success"});

  }catch(e){
    res.status(400).json({ status: "fail", e });
  }
}

// 로그인
userController.loginWithEmail= async (req, res) => {
  try{
    const {email, password} = req.body;

    const user = await User.findOne({email}, "-createdAt -updatedAt -__v");

    if(user){
      const isMatch = bcrypt.compareSync(password, user.password);
      
      if(isMatch){
        const token = user.generateToken();
        console.log(token);
        const rUser = {
          _id: user._id,
          name: user.name,
          email: user.email
        }
        return res.status(200).json({status: "success", rUser, token});
      }else{
        throw new Error('아이디 또는 비밀번호가 일치하지 않습니다.');
      }
    }
  }catch(e){
    res.status(400).json({ status: "fail", message:e.message });
  }
}



module.exports = userController;