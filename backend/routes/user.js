const express = require('express')
const UserModel = require('../models/user')
const user_router = express.Router()
const jwt = require('jsonwebtoken')
const opencage = require('opencage-api-client');
user_router.use(express.urlencoded({ extended: true }))
const bcrypt = require('bcrypt')
require('dotenv').config()
const { validate_email, validate_mobile_number, validate_password, verify_mobile_number, verify_email } = require('../middlewares/verification')
const {authenticatetoken, accesstokengenerator} = require('../Middlewares/token')

user_router.post("/signup", async (req, res) => {
    const verifyemail = await verify_email(req.body.Email)
    if (verifyemail != true) {
        return res.json({
            error: verifyemail
        })
    }

    const verifymobilenumber = await verify_mobile_number(req.body.Mobilenumber)

    if (verifymobilenumber != true) {
        return res.json({
            error: verifymobilenumber
        })
    }
    if (typeof req.body.Password !== "string" || req.body.Password.length === 0) return res.json({error:"Passowrd provided is not valid"})

    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(req.body.Password, salt)
        req.body.Password = hash
        const newuser = new UserModel(req.body)
        const finaluser = await newuser.save()
        const token = accesstokengenerator(finaluser._id)
        return res.json({ error: "", token })

    } catch (error) {
        return res.json({ error: "Inputs provided are not valid" })
    }
})

user_router.post("/login", async (req, res) => {
    try {
        const user = await UserModel.findOne({ Email: req.body.Email })
        const isMatching = await bcrypt.compare(req.body.Password, user.Password)
        if (user != null && isMatching) {
            const token = accesstokengenerator(user._id)
            return res.json({ error: "", token })
        }

    } catch (error) {
        return res.json({ error: "Please signup to continue" })
    }

    return res.json({ error: "Password provided was not correct" })
})

user_router.post("/profile", authenticatetoken,async (req, res) => {

    try {

        let user = await UserModel.findById(req.verifieduser.id)
        const { Name, Mobilenumber, Email, Location } = user
        return res.json({ Name, Mobilenumber, Email, error: "", Location })

    } catch {
        return res.json({ error: "User has not loggin in" })
    }
})

user_router.put("/profile",authenticatetoken ,async (req, res) => {
    try {
        if (Object.keys(req.body).length !== 5 || req.body.Password === undefined || req.body.NewPassword === undefined) {
            return res.json({ error: "Inputs provided are not of valid format" })
        }

        if (req.body.Name === undefined || req.body.Name.length === 0) return res.json({ errror: "Name is not valid" })

        const email = await validate_email(req.body.Email, verifieduser.id)
        const mobilenumber = await validate_mobile_number(req.body.Mobilenumber, verifieduser.id)

        if (req.verifieduser.id != email) {
            return res.json({ error: "Another user with this email exists" })
        }

        if (req.verifieduser.id != mobilenumber) {
            return res.json({ error: "Another user with this mobile number exists" })
        }

        let editeduser = {}

        if (req.body.Password !== "" && req.body.NewPassword !== "" && typeof req.body.NewPassword === "string") {
            const oldpassword = await validate_password(req.body.Password, verifieduser.id)
            if (oldpassword === true) {
                const salt = await bcrypt.genSalt(10)
                const hash = await bcrypt.hash(req.body.NewPassword, salt)
                editeduser.Password = hash
            }
        }

        delete req.body.NewPassword
        delete req.body.Password
        editeduser = { ...editeduser, ...req.body }

        updateduser = await UserModel.updateOne({ _id:req.verifieduser.id }, { $set: editeduser })
        return res.json({ error: "" })

    } catch (error) {
        console.log("Error occurred while editing profile")
        return res.json({ error: "Error occurred at backend" })
    }
})

user_router.post("/location", authenticatetoken,async (req, res) => {
    try {
        const location = await opencage.geocode({ q: req.body.location })
        return res.json({ useraddress: location.results[0].components, error: "" })

    } catch (error) {
        return res.json({ error: "Sorry your location cannot be fetched" })
    }
})

user_router.put("/location", authenticatetoken,async (req, res) => {

    try {
        let user = await UserModel.findById(req.verifieduser.id)
        if (user === null) {
            return res.json({ error: "No such user present" })
        }

        const location = await opencage.geocode({ q: req.body.location })
        if (location.results[0].components.country !== "India" || location.results[0].components.state === undefined) {
            return res.json({ error: "Sorry we do not serve this area" })
        }

        await UserModel.updateOne({ _id: req.verifieduser.id }, { $set: { Location: req.body.Location } })
        return res.json({ error: "" })
    }

    catch(error) {
        return res.json({ error: "Location not saved" })
    }
})

module.exports = user_router