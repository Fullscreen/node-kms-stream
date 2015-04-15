kms-stream
==========

Encrypt / Decrypt data streams with Amazon's KMS service

example
=======
``` js
var fs = require('fs')
  , kms = require('kms-stream')(/* [ aws_config ] */);

// encrypt
var key;
var encryptStream = kms.encrypt('alias/MyKMSKey');
fs
  .createReadStream('./plaintext_secrets.txt')
  .pipe(encryptStream)
  .pipe(fs.createWriteStream('./encrypted_secrets.txt'));

// save encrypted data key
encryptStream.on('key', function(key) {
  key = key;
});

// decrypt
var myEncryptedDataKey = '...';
fs
  .createReadStream('./encrypted_secrets.txt')
  .pipe(kms.decrypt(myEncryptedDataKey))
  .pipe(process.stdout);
```

install
=======

With [npm](http://npmjs.org) do:

```
npm install kms-stream
```
