const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');

async function loginUser(username) {
  const ccpPath = path.resolve(__dirname, '../organizations/peerOrganizations/org1.example.com/connection-org1.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  const walletPath = path.join(process.cwd(), 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const identity = await wallet.get(username);
  if (!identity) {
    throw new Error(`Identity for user ${username} not found in wallet`);
  }

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: username,
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('basic');

  const resultBuffer = await contract.evaluateTransaction('GetAllAssets');
  const resultJson = resultBuffer.toString('utf8');

  let result;
  try {
    result = JSON.parse(resultJson); //  convert to proper JS object/array
  } catch (e) {
    result = resultJson; // fallback in case it’s not JSON
  }

  await gateway.disconnect();
  return result;
}

module.exports = loginUser;
