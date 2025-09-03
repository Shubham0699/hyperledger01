const fs = require('fs');
const path = require('path');
const { Wallets, Gateway } = require('fabric-network');

async function main() {
  try {
    const ccpPath = path.resolve(__dirname, 'organizations/peerOrganizations/org1.example.com/connection-org1.json');
    const walletPath = path.resolve(__dirname, 'wallet');
    const userId = 'user1';
    const channelName = 'mychannel';
    const chaincodeName = 'basic';

    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get(userId);
    if (!identity) {
      console.error(`Identity for the user "${userId}" not found in wallet. Run the addToWallet script first.`);
      process.exit(1);
    }

    const gateway = new Gateway();
    await gateway.connect(ccp, {
      wallet,
      identity: userId,
      discovery: { enabled: true, asLocalhost: true }
    });

    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(chaincodeName);

    // Submit InitLedger transaction (this will populate sample assets)
    console.log('Submitting InitLedger transaction...');
    await contract.submitTransaction('InitLedger');
    console.log('InitLedger transaction has been submitted.');

    await gateway.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('InitLedger failed:', err);
    process.exit(1);
  }
}

main();
