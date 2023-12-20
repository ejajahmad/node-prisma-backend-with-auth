import {PrismaClient} from "@prisma/client";
import {Server} from "socket.io";
import express from "express";

export default function setupVideoCallSocket(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        // Handle user joined
        console.log("User joined");
    });
}
