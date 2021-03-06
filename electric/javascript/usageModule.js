/*
* SPDX-License-Identifier: Apache-2.0
*/

'use strict';

const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');
const chanelInfoModule = require('../../test-network/channelInfoModule')

let contract = null
const startTime = '1554650825727'
const usageIdStart = 'USAGE0000'
const usageIdEnd = 'USAGE9999'

async function initializeUsageModule() {
	try {
		// load the network configuration
		const ccpPath = path.resolve(__dirname, '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
		const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

		// Create a new file system based wallet for managing identities.
		const walletPath = path.join(__dirname, 'usageWallet');
		const wallet = await Wallets.newFileSystemWallet(walletPath);
		console.log(`Wallet path: ${walletPath}`);

		// Check to see if we've already enrolled the user.
		const identity = await wallet.get('usageAppUser');
		if (!identity) {
			console.log('An identity for the user "usageAppUser" does not exist in the wallet');
			console.log('Run the registerUser.js application before retrying');
			return;
		}

		// Create a new gateway for connecting to our peer node.
		const gateway = new Gateway();
		await gateway.connect(ccp, { wallet, identity: 'usageAppUser', discovery: { enabled: true, asLocalhost: true } });

		// Get the network (channel) our contract is deployed to.
		const network = await gateway.getNetwork('mychannel');

		// Get the contract from the network.
		contract = network.getContract('electric');
		console.log('Successfully initialized usage module')
	} catch (error) {
		console.error('Failed to initialize usage module')
	}
}

async function getAllUsage() {
	const error = {
		code: 0,
		message: 'Failed to get usage data'
	}
	const startKey = `${usageIdStart}${startTime}`
	const endKey = `${usageIdEnd}${(new Date).getTime()}`

	const promise = new Promise((resolve, reject) => {
		if (contract) {
			try {
				contract.evaluateTransaction('queryAllUsage', startKey, endKey)
				.then(result => {
					console.log(`Transaction getAllUsage has been evaluated successfully`);
					resolve({
						code: 1,
						usages: JSON.parse(result)
					})
				})
			} catch (error) {
				console.error(`Failed to evaluate transaction getAllUsage: ${error}`);
				reject(error)
			}
		} else {
			console.error('Contract not found: getAllUsage')
			reject(error)
		}
	})

	return promise
}

async function getUsageForUser(userId) {
	const error = {
		code: 0,
		message: 'Failed to get usage data'
	}
	const usageId = `USAGE${userId.split('USER')[1]}`
	const startKey = `${usageId}${startTime}`
	const endKey = `${usageId}${(new Date).getTime()}`

	const promise = new Promise((resolve, reject) => {
		if (contract) {
			try {
				contract.evaluateTransaction('queryUsageForUser', startKey, endKey)
				.then(result => {
					console.log(`Transaction getAllUsage has been evaluated successfully`);
					resolve({
						code: 1,
						usages: JSON.parse(result)
					})
				})
			} catch (error) {
				console.error(`Failed to evaluate transaction getAllUsage: ${error}`);
				reject(error)
			}
		} else {
			console.error('Contract not found: getAllUsage')
			reject(error)
		}
	})

	return promise
}

async function createUsage(usageData = {}) {
	const error = {
		code: 0,
		message: 'Failed to create user'
	}
	const { userId, time = 0, voltage = 0, current = 0, power = 0, frequency = 0, energy = 0 } = usageData
	const usageId = `USAGE${userId.split('USER')[1]}${(new Date()).getTime()}`

	const promise = new Promise((resolve, reject) => {
		if (contract) {
			if (userId) {
				try {
					contract.submitTransaction('createUsage', usageId, userId, time, voltage, current, power, frequency, energy);
					console.log(`Transaction createUsage has been submitted successfully`);
					resolve({
						code: 1,
						user: usageData
					})
					// Update the channel info traker
					chanelInfoModule.updateChannelInfo()
				} catch (error) {
					console.error(`Failed to submit transaction createUsage: ${error}`);
					reject(error)
				}
			} else {
				console.error('userId not found: createUsage')
				reject(error)
			}
		} else {
			console.error('Contract not found: createUsage')
			reject(error)
		}
	})

	return promise
}

const UsageModule = {
	initializeUsageModule,
	getAllUsage,
	getUsageForUser,
	createUsage
}

module.exports = UsageModule