const fs = require("fs");
const path = require("path");
const { Wallets } = require("fabric-network");

async function main() {
    try {
        // Path to User1 MSP
        const mspPath = path.resolve(__dirname, "organizations/peerOrganizations/org1.example.com/users/User1@org1.example.com/msp");

        const cert = fs.readFileSync(path.join(mspPath, "signcerts", "cert.pem")).toString();
        const keyFiles = fs.readdirSync(path.join(mspPath, "keystore"));
        const key = fs.readFileSync(path.join(mspPath, "keystore", keyFiles[0])).toString();

        // Wallet setup
        const wallet = await Wallets.newFileSystemWallet(path.join(__dirname, "wallet"));

        const identity = {
            credentials: {
                certificate: cert,
                privateKey: key,
            },
            mspId: "Org1MSP",
            type: "X.509",
        };

        await wallet.put("user1", identity);
        console.log(" Successfully added user1 to the wallet");
    } catch (error) {
        console.error(`Failed to add identity: ${error}`);
        process.exit(1);
    }
}

main();
