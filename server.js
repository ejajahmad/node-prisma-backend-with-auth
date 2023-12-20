import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";
import fs from "fs";
import cookieParser from "cookie-parser";
import compression from "compression";
import https from "https";
import setupVideoCallSocket from "./utils/ChatServer.util.js";
import authenticationRoutes from "./routes/AuthenticationRoutes.js";
import testApiRoutes from "./routes/TestApiRoutes.js";
import partnerRoutes from "./routes/PartnerRoutes.js";
import clientRoutes from "./routes/ClientRoutes.js";
import consultationRoutes from "./routes/ConsultationRoutes.js";
import bodyParser from "body-parser";
import miscRoutes from "./routes/MistRoutes.js";
import razorpayRoutes from "./routes/RazorpayRoutes.js";
import communityRoutes from "./routes/CommunityRoutes.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "200MB" }));
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
app.use(cookieParser());
app.use(compression());

app.use(cors());

// Certificate
const privateKey = fs.readFileSync("/etc/letsencrypt/live/partner.collegevidya.com/privkey.pem", "utf8");
const certificate = fs.readFileSync("/etc/letsencrypt/live/partner.collegevidya.com/cert.pem", "utf8");
const ca = fs.readFileSync("/etc/letsencrypt/live/partner.collegevidya.com/chain.pem", "utf8");

const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

app.use(authenticationRoutes);


const httpsServer = https.createServer(credentials, app);

setupVideoCallSocket(httpsServer);

const port = process.env.PORT;
httpsServer.listen(port, () => {
});
