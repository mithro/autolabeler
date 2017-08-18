const crypto = require('crypto');
const hash = crypto.createHash('sha256');
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please set a password: ', (password) => {
    hash.update(password);
    const hexPassword = hash.digest('hex');
    fs.writeFile('.passwordHash', hexPassword, function (err) {
        if (err)
            return console.log(err);
        console.log(hexPassword + " > .hashPassword");
    });
    rl.close();
});
