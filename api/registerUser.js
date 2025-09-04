const fs = require('fs');
const path = require('path');
const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');

async function registerUser(username) {
  const ccpPath = path.resolve(__dirname, '../organizations/peerOrganizations/org1.example.com/connection-org1.json');
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

  const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
  const ca = new FabricCAServices(caURL);

  const walletPath = path.join(process.cwd(), 'wallet');
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const userIdentity = await wallet.get(username);
  if (userIdentity) {
    throw new Error(`User ${username} already exists in wallet`);
  }

  const adminIdentity = await wallet.get('admin');
  if (!adminIdentity) {
    throw new Error('Admin identity not found. Run CA admin enrollment first.');
  }

  const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
  const adminUser = await provider.getUserContext(adminIdentity, 'admin');

  const secret = await ca.register({ enrollmentID: username, role: 'client' }, adminUser);
  const enrollment = await ca.enroll({ enrollmentID: username, enrollmentSecret: secret });

  const x509Identity = {
    credentials: {
      certificate: enrollment.certificate,
      privateKey: enrollment.key.toBytes(),
    },
    mspId: 'Org1MSP',
    type: 'X.509',
  };

  await wallet.put(username, x509Identity);
  return true;
}

module.exports = registerUser;
