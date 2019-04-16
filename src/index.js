const logger = process.env.DEBUG ? console.log : () => null;

const socket_io_client = require("socket.io-client");
const querybuilder = require("querybuilder");
const {send, init_keypair } = require("./business");


const wss = target => {
  var socket = socket_io_client(`http://${target}/`);
  let qb_instance;
  
  socket.on("return", function(data) {
    logger("returning from server: ");
    logger(data);
  });
  
  socket.on("error", logger);

  const self = {
    init_keypair,
    qb: (database, collection) => {
      const _qb = querybuilder(database, collection)
      qb_instance = Object.assign(_qb, {
        send: () => {
          return send(socket, qb_instance.value());
        }
      });
      return qb_instance;
    },
    me: () => logger(self),
    join: (room) => {
      socket.emit("join", room);
    },
    on: null,
    once: null,
    close: socket.close
  };

  return self;
};

module.exports = wss;
