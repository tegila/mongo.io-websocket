const logger = process.env.DEBUG ? console.log : () => null;

const port = process.env.PORT || 3000;
const io = require("socket.io")(port);

const business = require("./business");

io.sockets.on("connection", function(socket) {
  logger("connected");

  socket.on("join", function(collection) {
    logger("joining room", collection);
    socket.join(collection);
  });

  socket.on("leave", function(collection) {
    logger("leaving room", collection);
    socket.leave(collection);
  });

  business(socket);
});
