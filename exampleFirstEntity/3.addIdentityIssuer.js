const { transactionFactory, UserIdentity } = require('alastria-identity-lib')
let Web3 = require('web3')
let fs = require('fs')
let keythereum = require('keythereum')

let rawdata = fs.readFileSync('../configuration.json')
let configData = JSON.parse(rawdata)

let keyDataEntity1 = fs.readFileSync('../keystores/entity1-a9728125c573924b2b1ad6a8a8cd9bf6858ced49.json')
let keystoreDataEntity1 = JSON.parse(keyDataEntity1)
let keyDataAdmin = fs.readFileSync('../keystores/admin-6e3976aeaa3a59e4af51783cc46ee0ffabc5dc11.json')
let keystoreDataAdmin = JSON.parse(keyDataAdmin)

// Init your blockchain provider
let myBlockchainServiceIp = configData.nodeURL
const web3 = new Web3(new Web3.providers.HttpProvider(myBlockchainServiceIp))

let adminKeyStore = keystoreDataAdmin

let adminPrivateKey
try {
	adminPrivateKey = keythereum.recover(configData.addressPassword, adminKeyStore)
} catch (error) {
	console.log("ERROR: ", error)
	process.exit(1);
}

let adminIdentity = new UserIdentity(web3, `0x${adminKeyStore.address}`, adminPrivateKey)

// Im not sure if this is needed
async function unlockAccount() {
	let unlockedAccount = await web3.eth.personal.unlockAccount(adminIdentity.address, configData.addressPassword, 500)
	console.log('Account unlocked:', unlockedAccount)
	return unlockedAccount
}

let entity1KeyStore = keystoreDataEntity1;

async function mainAdd() {
	unlockAccount()
	console.log('\n ------ Example of adding the entity1 like a Issuer ------ \n')
	let transactionAddIssuer = await transactionFactory.identityManager.addIdentityIssuer(web3, configData.didEntity1, configData.issuerLevel)
	let getKnownTxAddIssuer = await adminIdentity.getKnownTransaction(transactionAddIssuer)
	console.log('The transaction bytes data is: ', getKnownTxAddIssuer)
	web3.eth.sendSignedTransaction(getKnownTxAddIssuer)
		.on('transactionHash', function (hashAddIssuer) {
			console.log("HASH: ", hashAddIssuer)
		})
		.on('receipt', function (receiptAddIssuer) {
			console.log("RECEIPT: ", receiptAddIssuer)
		})

		.on('error', function (error) {
			console.error(error)
			process.exit(1);
		});
	// If this is a revert, probably this Subject (address) is already a SP
}

mainAdd()
