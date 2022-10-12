const express = require("express");
const { Secret } = require("otpauth");
const { recoveryCode } = require("../controllers/userController");
const db = require("../repositories/models/index");
//Assigning db.users to User variable
const User = db.users;

//Function to check if username or email already exist in the database
//this is to avoid having two users with the same username and email
const saveUser = async (req, res, next) => {
    //search the database to see if user exist
    try {
        const username = await User.findOne({
            where: {
                username: req.body.username,
            },
        });
        //if username exist in the database respond with a status of 409
        if (username) {
            return res
                .status(409)
                .json({ status: "unauthorized", status_code: 409, error_message: "username already taken" });
        }
        //checking if email already exist
        const emailcheck = await User.findOne({
            where: {
                email: req.body.email,
            },
        });
        //if email exist in the database respond with a status of 409
        if (emailcheck) {
            return res
                .status(409)
                .json({ status: "unauthorized", status_code: 409, error_message: "email already taken" });
        }
        next();
    } catch (error) {
        console.log(error);
    }
};
const emailcheck = async (req, res, next) => {
    //search the database to see if user exist
    try {
        //checking if email already exist
        const emailcheck = await User.findOne({
            where: {
                email: req.params.email,
            },
        });
        //if email exist in the database respond with a status of 409
        if (emailcheck) {
            const otp = Math.floor(100000 + Math.random() * 900000);
            console.log(otp)
            const item = await User.update(
                {
                    otpSecret: otp,
                },
                {
                    where: {
                        email: req.params.email,
                    },
                }
            );
            // await item.save();
            return res.status(200).json({ status: "success", status_code: 200, error_message: "success", emailcheck,item  });
        } else {
            return res
                .status(409)
                .json({ status: "unprocessable_entity", status_code: 409, error_message: "invalid email" });
        }
        next();
    } catch (error) {
        console.log(error);
    }
};
//exporting module
module.exports = {
    saveUser,
    emailcheck,
};
