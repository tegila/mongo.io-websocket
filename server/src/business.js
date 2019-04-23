const logger = process.env.DEBUG ? console.log : () => null;

const J2M = require("j2m");
const j2m = J2M(`mongodb://${process.env.DATABASE_URL || "localhost"}:27017`);

const crypt = require("../common")();
// crypt.init_keypair();

// message stage
const message_stage = (payload, socket) => {
  const { message, hash, pubkey, signature } = payload;

  const signature_is_valid = crypt.check_signature(
    hash,
    signature,
    pubkey
  );
  logger(`signature_is_valid: ${signature_is_valid}`);

  j2m
    .exec(message)
    .then(ret => {
      const payload_hash = crypt.hash_message(payload);
      logger(`payload_hash: ${payload_hash}`);
      // return the answer to the client
      socket.emit(`${payload_hash}`, ret);
      logger(`sending return: ${ret}`);
      // broadcast if it's a save, update or delete
      // io.sockets.in(data.collection).emit("message", data);
    })
    .catch(logger);
};

// pre-message stage
const initial_stage = (message_hash, socket) => {
  logger(`message_hash: ${message_hash}`);

  const nonce = Math.random();
  logger(`nonce: ${nonce}`);

  const message_hash_nonce = crypt.hash_message({ message_hash, nonce });
  socket.once(`${message_hash_nonce}`, payload => {
    // check for FAKE message
    if (payload.hash !== message_hash_nonce)
      return logger(`${payload.hash} !== ${message_hash_nonce}`);
    message_stage(payload, socket);
  });
  logger(`message_hash_nonce: ${message_hash_nonce}`);

  socket.emit(`${message_hash}`, nonce);
};

module.exports = socket => {
  socket.on("message_hash", message_hash => initial_stage(message_hash, socket));
};
