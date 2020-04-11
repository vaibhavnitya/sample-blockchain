/*
* SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
var ab2str = require('arraybuffer-to-string');

let contract = null
const startUserId = 'USER0000'
const endUserId 	= 'USER9999'

async function initializeUserModule() {
	try {
		// load the network configuration
		const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
		const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(__dirname, 'userWallet');
		const wallet = await Wallets.newFileSystemWallet(walletPath);
		console.log(`Wallet path: ${walletPath}`);

		// Check to see if we've already enrolled the user.
		const identity = await wallet.get('appUser');
		if (!identity) {
			console.log('An identity for the user "appUser" does not exist in the wallet');
			console.log('Run the registerUser.js application before retrying');
			return;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork('mychannel');

		// Get the contract from the network.
		contract = network.getContract('electric');
		console.log('Successfully initialized user module')
	} catch (error) {
		console.error('Failed to initialize user module')
	}
}

function checkUserRegistered() {
	const promise = new Promise((resolve, reject) => {
		try {
			// load the network configuration
			const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
			const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

			// Create a new file system based wallet for managing identities.
			const walletPath = path.join(__dirname, 'userWallet');
			Wallets.newFileSystemWallet(walletPath)
			.then(wallet => {
				wallet.get('appUser')
				.then(identity => {
					if (identity) {
						resolve('User registered')
					} else {
						reject('User not registered')
					}
				}).catch(error => {
					reject('User not registered')
				})
			}).catch(error => {
				reject('User not registered')
			})
		} catch (error) {
			reject('User not registered')
		}
	})

	return promise
}

async function getAllUsers() {
	const error = {
		code: 0,
		message: 'Failed to get user data'
	}
	
	const promise = new Promise((resolve, reject) => {
		if (contract) {
			try {
				contract.evaluateTransaction('queryAllUsers', startUserId, endUserId)
				.then(result => {
					console.log(`Transaction getAllUsers has been evaluated successfully`);
					resolve({
						code: 1,
						users: JSON.parse(result)
					})
				})
			} catch (error) {
				console.error(`Failed to evaluate transaction: ${error}`);
				reject(error)
			}
		} else {
			console.error('Contract not found: getAllUsers')
			reject(error)
		}
	})

	return promise
}

async function getUser(userId) {
	const error = {
		code: 0,
		message: 'Failed to get user data'
	}
	
	const promise = new Promise((resolve, reject) => {
		if (contract) {
			try {
				contract.evaluateTransaction('queryUser', userId)
				.then(result => {
					console.log(`Transaction getUser has been evaluated successfully`);
					resolve({
						code: 1,
						user: JSON.parse(ab2str(JSON.parse(result.toString()).data))
					})
				})
				.catch(error => {
					reject(error)
				})
			} catch (error) {
				console.error(`Failed to evaluate transaction: ${error}`);
				reject(error)
			}
		} else {
			console.error('Contract not found: getUser')
			reject(error)
		}
	})
	
	return promise
}

async function createUser(userData = {}) {
	const error = {
		code: 0,
		message: 'Failed to create user'
	}
	const { userId, userName } = userData
	
	const promise = new Promise((resolve, reject) => {
		if (contract) {
			if (userId && userName) {
				try {
					contract.submitTransaction('createUser', userId, userName);
					console.log(`Transaction createUser has been submitted successfully`);
					resolve({
						code: 1,
						user: userData
					})
				} catch (error) {
					console.error(`Failed to submit transaction createUser: ${error}`);
					reject(error)
				}
			} else {
				console.error('userId and userName not found: createUser')
				reject(error)
			}
		} else {
			console.error('Contract not found: createUser')
			reject(error)
		}
	})

	return promise
}

const UserModule = {
	initializeUserModule,
	checkUserRegistered,
	getAllUsers,
	getUser,
	createUser
}

module.exports = UserModule