const asyncErrorHandler = require("./../utils/asyncErrorHandler");
const customError = require("./../utils/customError");
const User = require("./../models/userModel.js");
const sendEmail = require("./../utils/email.js")

const getAllEmployees = asyncErrorHandler(async (req,res,next)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {role:{$nin: ["manager","customer"]}}
    if(req.query.name){
        filter.name = {$regex:req.query.name, $options:"i"};
    }
    if(req.query.email){
        filter.email = {$regex:req.query.email, $options:"i"};
    }
    const employees = await User.find(filter).select("-password").skip(skip).limit(limit);
    const employeeCount = await User.countDocuments(filter);
    res.status(200).json({
        status:"success",
        count:employeeCount,
        page,
        pages: Math.ceil(employeeCount/limit),
        data:{
            employees
        }
    })
})

const getUserInfo = asyncErrorHandler(async (req,res,next)=>{
    const user = await User.findById(req.user.id);
    if(!user){
        return next(new customError("User not found",404));
    }
    res.status(200).json({
        status:"success",
        data:{
            user
        }
    });
})

const getDeliverers = asyncErrorHandler(async (req,res,next)=>{
    const deliverers = await User.find({role:"deliverer"}).select("name email");
    res.status(200).json({
        status: "success",
        count: deliverers.length,
        data: {
            deliverers
        } 
    });
})

const editUserInfo = asyncErrorHandler(async (req,res,next)=>{
    const user = await User.findById(req.user.id);
    if(!user){
        return next(new customError("User not found",404));
    }
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    user.address.city = req.body.city || user.address.city;
    user.address.street = req.body.street || user.address.street;
    user.address.buildingNumber = req.body.buildingNumber || user.address.buildingNumber;

    await user.save();

    res.status(200).json({
        status: "success",
        data:{
            user
        }
    });
})

const deleteAccount = asyncErrorHandler(async (req,res,next)=>{
    const user = await User.findByIdAndDelete(req.user.id);
    if(!user){
        return next(new customError("User not found",404));
    }
    res.status(204).send()
})
const banAccount = asyncErrorHandler(async (req,res,next)=>{
    const {duration, message} = req.body;
    const user = await User.findById(req.params.id);
    if(!user){
        return next(new customError("User not found",404));
    }
    if(user.role != "customer"){
        return next(new customError("Only users can be banned",403))
    }
    user.isBanned = true;
    let banExpires = null;
    if(duration){
        const durationInDays = Number(duration);
        if(isNaN(durationInDays) || durationInDays <= 0){
            return next(new customError("Duration must be a number bigger than 0",400));
        }
        banExpires = new Date();
        banExpires.setDate(banExpires.getDate() + durationInDays);
    }
    user.banExpires = banExpires;
    await user.save();
    await sendEmail({
        to: user.email,
        subject: "You Are Banned",
        html: `
            <h2>Your account has been suspended.</h2>
            <p>${duration?`Your account has been banned for <strong>${duration} day</strong>.`:`Your account has been permanently banned.`}</p>
            <p><strong>Reason:</strong> ${message || "Violation of rules"}</p>
            <br>
            <p>If you believe this is a mistake, please contact support.</p>
            `
    });
    res.status(204).send()
})

module.exports = {getUserInfo, editUserInfo, deleteAccount, banAccount, getDeliverers, getAllEmployees}