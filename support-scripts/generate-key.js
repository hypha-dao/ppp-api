const path = require('path');
const fs = require('fs')
const { JWK, JWT } = require('jose');

(async () => {

  const {
    argv
  } = process;

  if(argv.length !== 3){
    console.log('generate-key <file-prefix>')
    return
  }

  const prefix = argv[2];

  const key = await JWK.generate('RSA', 2048, { alg: 'RS256', use: 'sig' });
  console.log('key: ', key);
  const dir = path.join(__dirname, '../keys');
  if(!fs.existsSync(dir)){
    console.log(`Creating dir ${dir} ...`);
    fs.mkdirSync(dir);
  }
  const publicKeyFileName = path.join(dir, `${prefix}-public.pem`);
  const privateKeyFileName = path.join(dir, `${prefix}-private.pem`);
  const fileOptions = {flag:'wx'}
  console.log(`Generating PEM public key file: ${publicKeyFileName} ...`);
  fs.writeFileSync(publicKeyFileName, key.toPEM(),fileOptions);
  const pemPrivateKey = key.toPEM(true);
  console.log(`Generating PEM private key file: ${privateKeyFileName} ...`);
  fs.writeFileSync(privateKeyFileName, pemPrivateKey, fileOptions);
  /* console.log('JWK public key: ', key.toJWK())
  console.log('JWK private key: ', key.toJWK(true)) */
/* 
  const importedKey = JWK.asKey(pemPrivateKey, { alg: 'RS256', use: 'sig' });
  console.log('Key Type: ', importedKey.kty);
  console.log('Key Alg: ', importedKey.alg);
  console.log('Key Use: ', importedKey.use);

  if (pemPrivateKey === importedKey.toPEM(true)) {
    console.log('Key imported correctly!')
  } else {
    throw new Error('Unable to import key')
  }

  const token = JWT.sign(
    {
      sub: 'eos account',
      iss: 'https://app.telos.net',
      aud: 'codimd',
    },
    importedKey,
    {
      expiresIn: '24 hours'
    }
  );

  console.log('JWT Token:', token);

  try {

    const verification = JWT.verify(token, key, {
      sub: 'eos account',
      iss: 'https://app.telos.net',
      aud: 'codimd',
    });
    console.log('Token validation successful!', verification);
  } catch (error) {
    console.log('Failed to verify token');
  }

 */

})()