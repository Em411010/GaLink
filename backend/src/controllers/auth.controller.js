import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { sendWelcomeEmail } from "../services/email.service.js";
function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
}
function setTokenCookie(res, token) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
}
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "All fields are required" });
    if (await User.findOne({ email })) return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password });
    await sendWelcomeEmail(email, name);
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.status(201).json({ _id: user._id, name: user.name, email: user.email, isFreelancer: user.isFreelancer, profilePhoto: user.profilePhoto, badgeLevel: user.badgeLevel || 0, portfolio: user.portfolio || [] });
  } catch (error) { next(error); }
}
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: "Invalid email or password" });
    const token = generateToken(user._id);
    setTokenCookie(res, token);
    res.json({ _id: user._id, name: user.name, email: user.email, isFreelancer: user.isFreelancer, isAdmin: user.isAdmin, profilePhoto: user.profilePhoto, badgeLevel: user.badgeLevel || 0, portfolio: user.portfolio || [] });
  } catch (error) { next(error); }
}
export async function logout(req, res) {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
}
export async function getMe(req, res) {
  res.json(req.user);
}
