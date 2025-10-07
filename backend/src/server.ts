import express, { Application } from "express";
import http from "http";
import { Server } from "socket.io";
import { ENV } from "./config/env";
import cors from "cors";
import { registerPollHandlers } from "./sockets/poll.socket";

const app: Application = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Live Polling System Backend Running");
});

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);
  registerPollHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

const PORT = ENV.socketPort;
server.listen(PORT, () => {
  console.log(`Socket Server running on http://localhost:${PORT}`);
});
