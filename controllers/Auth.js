const bcrypt=require("bcrypt");
const User=require("../models/User");
const jwt=require("jsonwebtoken");
require("dotenv").config();

exports.signup=async(req,res)=>{
    try{
        const {name,email,password,role}=req.body;
        const existingUser=await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exists",
            });
        }
        //secure password
        let hashedPassword;
        try{
            hashedPassword=await bcrypt.hash(password,10);
        }
        catch(err){
            return res.status(500).json({
                success:false,
                message:"Error in hashing password",
            });
        }

        const user=await User.create({
            name,email,password:hashedPassword,role
        })

        return res.status(200).json({
            success:true,
            message:"User created Successfully",
        });

    }
    catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"User cannot be registered.Please, try again later",
        });
    }
};

exports.login=async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"Please fill all the details",
            });
        }
        let user=await User.findOne({email});
        if(!user){
            return res.status(401).json({
                success:false,
                message:"User is not registered",
            });
        }
        const payload={
            email:user.email,
            id:user._id,
            role:user.role
        }
        // verify password and generate a jwt token
        if(await bcrypt.compare(password,user.password)){
            //create a jwt token
            let token=jwt.sign(payload,
                               process.env.JWT_SECRET,
                               {
                                expiresIn:"2h",
                               });
            user=user.toObject();
            user.token=token;
            user.password=undefined;
            const options={
                expires:new Date(Date.now()+3*24*60*60*1000),
                httpOnly:true,
            }
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"User Logged in successfully",
            });
        }
        else{
            //password do not match
            return res.status(403).json({
                success:false,
                message:"Password Incorrect",
            });
        }
    }
    catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Login Failure",
        });
    }
};