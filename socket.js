const { FRONTEND_URL } = require("./utils/constants");

let io;

module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: FRONTEND_URL,
        methods: ["GET", "POST"],
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io has not been initialised yet");
    }
    return io;
  },
};
