const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');

async function main() {
  try {
    // Paths
    const ccpPath = path.resolve(__dirname, 'organizations/peerOrganizations/org1.example.com/connection-org1.json');
    const walletPath = path.resolve(__dirname, 'wallet');
    const userId = 'user1';
    const channelName = 'mychannel';
    const chaincodeName = 'basic';

    // Load connection profile
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create wallet and check identity
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get(userId);
    if (!identity) {
      console.error(`Identity for the user "${userId}" not found in wallet. Run the addToWallet script first.`);
      process.exit(1);
    }

    // Connect to gateway
    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userId,
      discovery: { enabled: true, asLocalhost: true }
    });
  
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    const resultBuffer = await contract.evaluateTransaction('GetAllAssets');
    const result = resultBuffer.toString('utf8');

    console.log('Auth OK. Ledger query result:');
    console.log(result);

    // Cleanup
    await gateway.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Authentication test failed:', err);
    process.exit(1);
  }
}

main();
