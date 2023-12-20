import dotenv from "dotenv";
import express from "express";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";
import compression from "compression";
import http from "http";
import setupVideoCallSocket from "./utils/ChatServer.util.js";
import authenticationRoutes from "./routes/AuthenticationRoutes.js";
import bodyParser from "body-parser";


dotenv.config();

const app = express();
app.use(express.json({limit: "200MB"}));
app.use(express.urlencoded({extended: true}));
app.use(fileUpload());
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}));
app.use(cookieParser());
app.use(compression());

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header(
        "Access-Control-Allow-Headers",
        "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept"
    );
    next();
});


app.use(authenticationRoutes);
const httpServer = http.createServer(app);
setupVideoCallSocket(httpServer);

const port = process.env.PORT;
httpServer.listen(port, () => {
    console.log(`Server is running on ${port}`);
});