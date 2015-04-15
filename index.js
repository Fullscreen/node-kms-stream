/**
 * Encrypt / Decrypt data with Amazon's KMS API
 */
var AWS = require('aws-sdk')
  , crypto = require('crypto')
  , through = require('through')
  , duplexer = require('duplexer');

module.exports = KMS;

function KMS(options) {
  if (! (this instanceof KMS)) return new KMS(options);

  options = (options || {});
  AWS.config.update({
    accessKeyId: options.accessKeyId,
    secretAccessKey: options.secretAccessKey,
    region: (options.region || 'us-east-1')
  });

  this.kms = new AWS.KMS();
}

KMS.prototype.encrypt = function encrypt(key) {
  var inStream = through().pause()
    , outStream = through()
    , duplex = duplexer(inStream, outStream);

  var options = { KeyId: key, KeySpec: 'AES_256' };
  this.kms.generateDataKey(options, function onKey(err, data) {
    if (err) return outStream.emit('error', err);

    // emit the data key
    duplex.emit('key', data.CiphertextBlob);

    //  setup crypto pipeline
    inStream.pipe(
      crypto.createCipher('aes-256-cbc', data.Plaintext)
    ).pipe(outStream);

    // resume the input stream
    inStream.resume();
  });

  return duplex;
}

KMS.prototype.decrypt = function decrypt(key) {
  var inStream = through().pause()
    , outStream = through()
    , duplex = duplexer(inStream, outStream);

  this.kms.decrypt({ CiphertextBlob: key }, function onKey(err, data) {
    if (err) return duplex.emit('error', err);

    // connect decryptor with outstream
    inStream.pipe(
      crypto.createDecipher('aes-256-cbc', data.Plaintext)
    ).pipe(outStream);

    // resume the input stream
    inStream.resume();
  });

  return duplex;
}
