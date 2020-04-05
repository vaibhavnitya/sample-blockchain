/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class Electric extends Contract {

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        console.info('============= END : Initialize Ledger: nothing to initialize ===========');
    }

    async createUser(ctx, userId, userName) {
        console.info('============= START : Create User ===========');

        const user = {
            userId,
            userName,
            docType: 'user'
        };

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        console.info('============= END : Create User ===========');
    }

    async queryAllUsers(ctx) {
        const startKey = 'USER0';
        const endKey = 'USER9999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryUser(ctx, userId) {
        const userAsBytes = await ctx.stub.getState(userId);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${userId} does not exist`);
        }
        console.log(userAsBytes.toString());
        return JSON.stringify(userAsBytes)
    }

    async createUsage(ctx, userId, time, voltage, current, power, frquency, energy) {
        console.info('============= START : Create Usage ===========');

        const car = {
            userId,
            time,
            voltage,
            current,
            power,
            frquency,
            energy,
            docType: 'usage'
        };

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(car)));
        console.info('============= END : Create Usage ===========');
    }

    async queryAllUsage(ctx) {
        const startKey = 'USER0';
        const endKey = 'USER9999';
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    async queryUsageForUser(ctx, userId) {
        const usageAsBytes = await ctx.stub.getState(userId)
        if (!usageAsBytes || usageAsBytes.length === 0) {
            throw new Error(`Usage for ${userId} does not exist`);
        }
        console.log(usageAsBytes.toString());
        return JSON.stringify(usageAsBytes)
    }

}

module.exports = Electric;
