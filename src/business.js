const logger = process.env.DEBUG ? console.log : () => null;
const crypt = require("../common")();
const utils = require("../common/utils");

const second_stage_callback = (ret, resolve) => {
  logger(`getting return: ${ret}`);
  resolve(ret);
};

const first_stage_callback = (nonce, message, message_hash, socket, resolve) => {
  logger(`getting nonce: ${nonce}`);
  const message_hash_nonce = crypt.hash_message({ message_hash, nonce });
  logger(`message_hash_nonce: ${message_hash_nonce}`);
  // sign hash_nonce
  const signature = crypt.sign_message(message_hash_nonce);
  const payload = {
    message,
    hash: message_hash_nonce,
    pubkey: crypt.get_publicKey(),
    signature
  };
  logger(payload);
  const payload_hash = crypt.hash_message(payload);
  logger(`payload_hash: ${payload_hash}`);
  socket.once(payload_hash, ret => second_stage_callback(ret, resolve));
  socket.emit(message_hash_nonce, payload);
};

module.exports = {
  init_keypair: crypt.init_keypair,
  send: (socket, message) => {
    return new Promise(resolve => {
      const message_hash = crypt.hash_message(message);
      logger(`sending message_hash: ${message_hash}`);
      // *** asking for permissions ***
      // send a hash of the message (querybuilder object)and 
      // wait for a random number (nonce)
      socket.emit("message_hash", message_hash);
      socket.once(message_hash, nonce =>
        first_stage_callback(nonce, message, message_hash, socket, resolve)
      );
    });
  }
};
