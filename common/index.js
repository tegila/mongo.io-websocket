const nacl = require("tweetnacl");
const util = require("tweetnacl-util");

const enc = util.encodeBase64;
const dec = util.decodeBase64;

const str2ab = (str) => {
  const buf = new Uint8Array(str.length); // 2 bytes for each char
  for (let i = 0; i < str.length; i += 1) {
    buf[i] = str.charCodeAt(i);
  }
  return buf;
};

module.exports = () => {
  let keypair = null;
  return self = {
    get_secretKey: () => enc(keypair.secretKey),
    get_publicKey: () => enc(keypair.publicKey),
    init_keypair: secretKey => {
      keypair = secretKey
        ? nacl.sign.keyPair.fromSecretKey(dec(secretKey))
        : nacl.sign.keyPair();
    },
    sign_message: message => {
      return enc(nacl.sign.detached(dec(message), keypair.secretKey));
    },
    hash_message: message => {
      return enc(nacl.hash(str2ab(JSON.stringify(message))));
    },
    sign_message_hash: message => {
      return self.sign_message(dec(self.hash_message(message)));
    },
    sign_transaction: transaction => {
      return enc(self.sign_message_hash(transaction));
    },
    check_signature: (message, signature, pubkey) => {
      return nacl.sign.detached.verify(
        dec(message),
        dec(signature),
        dec(pubkey)
      );
    }
  };
};
