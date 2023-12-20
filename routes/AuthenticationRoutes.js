import express from "express";
import { forgotPassword, loginUserWithOtp, loginUser, logoutUser, refreshTokens, updatePassword } from "../controllers/AuthenticationController.js";

const authenticationRoutes = express.Router();
authenticationRoutes.post('/login-with-otp', loginUserWithOtp);
authenticationRoutes.post('/login', loginUser);
authenticationRoutes.get("/is-logged-in", refreshTokens);
authenticationRoutes.post("/forgot-password", forgotPassword);
authenticationRoutes.put("/update-password", updatePassword);
authenticationRoutes.post("/logout", logoutUser);

export default authenticationRoutes;
