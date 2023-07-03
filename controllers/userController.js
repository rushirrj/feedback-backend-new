const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userDetailCollection = require('../models/userModel');


const validateUser = async (userObj) => {
    try {
        const { name, email, mobile, password } = userObj;
        if (!name || !email || !mobile || !password) {
            return ({
                success: false,
                message: 'Empty input fields'
            });
        }
        //Check redundancy
        const isEmailExist = await userDetailCollection.findOne({ email });
        const isMobileExist = await userDetailCollection.findOne({ mobile });


        if (isEmailExist || isMobileExist) {
            return ({
                success: false,
                message: 'Mobile or Email already exists!'
            });
        }
        else {
            return ({
                success: true,
                message: 'User inputs are valid'
            });
        }
    }
    catch (err) {
        console.log('Error in validation', err);
        return ({
            success: false,
            message: 'Error in validation'
        })
    }
}

const registerUser = async (userObj) => {
    try {
        const { name, email, mobile, password } = userObj;
        const result = await validateUser(userObj);
        if (result.success) {
            let encryptedPassword = await bcrypt.hash(password, 10);
            const newUser = new userDetailCollection({
                name: name,
                email: email,
                mobile: mobile,
                password: encryptedPassword
            })
            const userRegistered = newUser.save();
            return({
                success: true,
                message: 'user registered successfully'
            })
        }
        else {
            return ({
                success: false,
                message: result.message
            })
        }
    }
    catch (err) {
        console.log('Error in registering new user', err);
        return ({
            success: false,
            message: 'Error in creating new user'
        })
    }
}

const loginUser = async(userObj)=>{
    const {email, password} = userObj;
    if(!email, !password){
        return({
            success: false,
            message: 'Empty input fields'
        })
    }
    else{
        const isEmailExist = await userDetailCollection.findOne({ email });
        if(isEmailExist){
            if (await (bcrypt.compare(password, isEmailExist.password))) {
                const token = jwt.sign(
                    { user_id: isEmailExist._id, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "1h",
                    }
                );
                return ({
                    success: true,
                    message: 'Token successfully generated',
                    token: token
                })
            }
            else {
                return ({
                    success: false,
                    message: 'Invalid Credentials'
                })
            }
        }
        else{
            return({
                success: false,
                message: 'User not registered'
            })
        }
    }
}

module.exports = {
    registerUser,
    loginUser 
}