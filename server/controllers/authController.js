// HANDLING ANY AUTHENTICATION RELATED REQUESTS
const router = require("express").Router();
const User = require("./../models/user");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// SIGNUP AND LOGIN LOGIC

router.post('/signup', async (req,res) => {
    try {
        //1.)if the user already exist 
        const user = await User.findOne({email: req.body.email})
        //2.) if the user exist, send an error response
        if(user){
            return res.status(400).send({
                message: "User already exists.",
                success: false
            })
        }
        //3.) encyrpt the password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        //4.) create a new user in db
        const newUser = new User(req.body);
        await newUser.save();

        //5.) send success response
        res.status(201).send({
            message: "User created successfully.",
            success: true
        });
        

    }catch(err) {
        res.send ({
            message: err.message,
            success: false
        })
    }
}) 

router.post('/login', async (req,res) => {
    try {
        //1.) check if user exist
        const user = await User.findOne({email: req.body.email}).select("+password");
        if(!user){
            return res.status(400).send({
                message: "User does not exist.",
                success: false
            });
        }
        //2.) check if the password is correct
        const isValid = await bcrypt.compare(req.body.password, user.password);
        if(!isValid){
            return res.status(400).send({
                message: "Invalid password.",
                success: false
            });
        }
        //3.) IF USER EXIST AND PASSWORD IS CORRECT, assign a JWT
        const token = jwt.sign({userId: user._id}, process.env.SECRET_KEY, {expiresIn: '1d'});

        res.status(200).send({
            message: "Login successful.",
            success: true,
            token: token
        });

    } catch(err) {
        res.send ({
            message: err.message,
            success: false
        })
    }
});

module.exports = router;