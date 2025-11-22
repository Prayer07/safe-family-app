import type { Request, Response } from "express";
import { User, type IUser } from "../models/User.js";
import { connectDB } from "../db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

function generateToken(user: IUser): string {
    return jwt.sign({ _id: user._id, fullname: user.fullname, email: user.email, phone: user.phone }, 
        JWT_SECRET, 
        { expiresIn: "7d" }
    );
}

export const register = async (req: Request, res: Response) => {
    try {
    await connectDB();

    const { fullname, email, phone, password }: IUser = req.body;
    if (!fullname || !email || !phone || !password) return res.status(400).json({error: "All fields are required"})

    const existingEmail = await User.findOne({ email })
    if (existingEmail) return res.status(400).json({error: "Email already exist"})

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = await User.create({
        fullname,
        email,
        password:hashedPassword,
        phone,
    })
    console.log(newUser)

    const token = generateToken(newUser)
    res.status(201).json({
        token,
        newUser: {
            id: newUser._id,
            fullname: newUser.fullname,
            email: newUser.email,
            phone: newUser.phone,
        }
    })
    console.log(token)

    } catch (err: unknown) {
        console.error(err)
        res.status(500).json({error: "Server Error"})
    }
}


export const login = async (req: Request, res: Response) => {
    try {
    await connectDB();

    const { email, password }: IUser = req.body;
    if (!email || !password) return res.status(400).json({error: "All fields are required"})

    const validEmail = await User.findOne({ email })
    if (!validEmail) return res.status(401).json({error: "Email does not exist"})

    const validPassword = await bcrypt.compare(password, validEmail.password)
    if (!validPassword) return res.status(401).json({error: "Incorrect Password"})

    const token = generateToken(validEmail);
    res.status(201).json({
        token,
        user: {
            id: validEmail._id,
            fullname: validEmail.fullname,
            email: validEmail.email,
            phone: validEmail.phone,
        }
    })
    console.log(token)

    } catch (err: unknown) {
        console.error(err)
        res.status(500).json({error: "Server Error"})
    }
}


export const getUser = async (req: Request, res: Response) => {
    try {
        if (!req.user?.id){
            return res.status(401).json({error: "Unauthorized User"})
        }

        const user = await User.findById(req.user.id).select("-password")
        if (!user){
            return res.status(404).json({error: "User not found"})
        }
        res.json(user)
    } catch (err: unknown) {
        console.log(err)
        res.status(500).json({error: "Server error"})
    }
}


export const saveExpoPushToken = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.expoPushToken = req.body.expoPushToken;
    await user.save();

    res.json({ success: true, message: "Expo push token saved" });
  } catch (err) {
    console.error("Error saving push token:", err);
    res.status(500).json({ message: "Server error" });
  }
};