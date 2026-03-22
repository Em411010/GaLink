import { Server } from "socket.io";
let io;
export function initSocket(server) {
  const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173").split(",").map(o => o.trim());
  io = new Server(server, {
    cors: {
      origin: (origin, cb) => cb(null, !origin || allowedOrigins.includes(origin)),
      methods: ["GET","POST"],
      credentials: true,
    },
  });
  const onlineUsers = new Map();
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      onlineUsers.set(userId, socket.id);
      // Join personal notification room
      socket.join(`user:${userId}`);
    }
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    socket.on("conversation:join", (convId) => socket.join(convId));
    socket.on("conversation:leave", (convId) => socket.leave(convId));
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });
  });
  return io;
}
export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
