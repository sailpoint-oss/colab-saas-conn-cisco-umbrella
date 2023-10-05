/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import {
    Context,
    KeyID,
    SimpleKey,
    StandardCommand,
    StdAccountCreateInput,
    StdAccountDeleteInput,
    StdAccountDisableInput,
    StdAccountEnableInput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountUnlockInput,
    StdAccountUpdateInput,
    StdEntitlementListInput,
    StdTestConnectionOutput
} from '@sailpoint/connector-sdk';
import { PassThrough } from 'stream';
import { connector } from '../src/index';

//////////////////////////////////////////////////////////////////////
//
// COMMON CONSTANTS
//
//////////////////////////////////////////////////////////////////////

// initialize app configuration context
const context: Context = {
    id: '964265dd-643e-4675-b097-4743ab883902',
    name: 'Cisco-Umbrella',
    version: 1.0
};

// source configuration
const config = {
    apiKey: 'Cisco-Umbrella API Key',
    keySecret: 'Cisco-Umbrella Key Secret'
};

// user
const user = '12122435';

// set config in node process env
process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(config), 'utf-8').toString('base64');

// Create unique id for creating multiple users
const createUUID = (): string => {
    let dt = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });

    return uuid;
};

// To create account, input for creating different username
let newUserName = 'testUser-' + createUUID();

let nativeIdentity = '';

//////////////////////////////////////////////////////////////////////
//
// Tests
//
//////////////////////////////////////////////////////////////////////

/**
 * Test the connection
 */
describe('Test Connection', () => {
    // jest.setup.js
    jest.setTimeout(5000000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 5000)); // avoid jest open handle error
    });

    test('[0] test connection success', async () => {
        await connector._exec(
            StandardCommand.StdTestConnection,
            context,
            undefined,
            new PassThrough({ objectMode: true }).on('data', (chunk: StdTestConnectionOutput) => {
                expect(chunk).not.toBeNull();
                expect(chunk).not.toBeUndefined();
                expect(chunk).toStrictEqual({});
            })
        );
    });
});

/**
 * Read an account
 */
describe('Read Account', () => {
    // jest.setup.js
    jest.setTimeout(5000000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 5000)); // avoid jest open handle error
    });

    let nativeIdentifier = { key: SimpleKey(user) } as StdAccountReadInput;

    test('[0] get account success', async () => {
        await connector._exec(
            StandardCommand.StdAccountRead,
            context,
            nativeIdentifier,
            new PassThrough({ objectMode: true }).on('data', (chunk: any) => {
                expect(chunk).not.toBeNull();
                expect(chunk).not.toBeUndefined();
                expect(KeyID(chunk).toString()).toBe(user);
            })
        );
    });
});

/**
 * List all accounts
 */
describe('List Accounts', () => {
    // jest.setup.js
    jest.setTimeout(500000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    test('[0] list accounts', async () => {
        let count = 0;
        await connector._exec(
            StandardCommand.StdAccountList,
            context,
            undefined,
            new PassThrough({ objectMode: true }).on('data', (chunk: any) => {
                expect(chunk).not.toBeNull();
                expect(chunk).not.toBeUndefined();
                expect(chunk.key.simple.id).not.toBeNull();
                expect(chunk.attributes).not.toBeUndefined();
                count++;
            })
        );

        expect(count).toBeGreaterThanOrEqual(1);
    });
});

/**
 * List all entitlements
 */
describe('List Entitlements', () => {
    // jest.setup.js
    jest.setTimeout(500000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 5000)); // avoid jest open handle error
    });

    test('[0] list roles success', async () => {
        let count = 0;
        await connector._exec(
            StandardCommand.StdEntitlementList,
            context,
            { type: 'group' } as StdEntitlementListInput,
            new PassThrough({ objectMode: true }).on('data', (chunk: any) => {
                expect(chunk).not.toBeNull();
                expect(chunk).not.toBeUndefined();
                expect(chunk.key).not.toBeNull();
                expect(chunk.key).not.toBeUndefined();
                expect(chunk.attributes.label).not.toBeNull();
                expect(chunk.attributes.label).not.toBeUndefined();
                expect(chunk.attributes.roleId).not.toBeNull();
                expect(chunk.attributes.roleId).not.toBeUndefined();
                count++;
            })
        );

        expect(count).toBeGreaterThanOrEqual(1);
    });
});

/**
 * Create Account
 */
describe('Create User and Delete User', () => {
    jest.setTimeout(500000000);

    afterAll(async () => {
        await new Promise<void>(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    });

    const email = newUserName + '@example.com';
    const firstName = newUserName;
    const lastName = newUserName;

    const plan = {
        identity: '',
        attributes: {
            email: email,
            firstname: firstName,
            lastname: lastName,
            roleId: 2,
            password: 'Trialaccount@123',
            timezone: 'UTC'
        }
    } as StdAccountCreateInput;

    test('create user success', async () => {
        await connector._exec(
            StandardCommand.StdAccountCreate,
            context,
            plan,
            new PassThrough({ objectMode: true }).on('data', (chunk: any) => {
                expect(chunk).not.toBeNull();
                expect(chunk).not.toBeUndefined();
                expect(chunk.key.simple.id).not.toBeNull();
                nativeIdentity = chunk.key.simple.id;
                expect(chunk.key.simple.id).not.toBeUndefined();
                expect(chunk.attributes).not.toBeNull();
                expect(chunk.attributes).not.toBeUndefined();
                expect(chunk.attributes.roleId).not.toBeNull();
                expect(chunk.attributes.roleId).not.toBeUndefined();
                expect(chunk.attributes.roleId).toStrictEqual(2);
            })
        );

        const deletionPlan = {
            key: { simple: { id: nativeIdentity } }
        };

        await connector._exec(
            StandardCommand.StdAccountDelete,
            context,
            deletionPlan,
            new PassThrough({ objectMode: true }).on('data', (chunk: any) => {
                expect(chunk).not.toBeNull();
                expect(chunk).not.toBeUndefined();
                expect(chunk).toStrictEqual({});
            })
        );
    });
});
