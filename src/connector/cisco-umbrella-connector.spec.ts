/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import {
    ResponseStream,
    SimpleKey,
    StdAccountCreateInput,
    StdAccountCreateOutput,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountUpdateInput,
    StdAccountUpdateOutput,
    Context,
    StdAccountDisableInput,
    StdAccountEnableInput,
    StdAccountUnlockInput
} from '@sailpoint/connector-sdk';
import { AxiosError } from 'axios';
import { PassThrough } from 'stream';
import { CiscoUmbrellaConnector } from '.';
import { CiscoUmbrellaConfig } from '.';

//////////////////////////////////////////////////////////////////////
//
// GLOBAL CONSTANTS
//
//////////////////////////////////////////////////////////////////////

const mockConfig = {
    apiKey: '12313YFHPZvSyZGsX',
    keySecret: 'cbeje1233213YFHPZ'
} as CiscoUmbrellaConfig;

//////////////////////////////////////////////////////////////////////
//
// Cisco Umbrella CLIENT MOCKS
//
//////////////////////////////////////////////////////////////////////
const error = new Error() as AxiosError;
error.isAxiosError = true;
(error.code = 'ERR_BAD_REQUEST'),
    (error.message = 'Request failed with status code 401'),
    (error.response = {
        status: '401',
        statusText: 'Unauthorized',
        data: 'No tenantId in your token'
    } as any);
const unauthorizedError = error;
const emptyRes = {};

// API token mock
const tokenResMock = {
    data: {
        access_token: '00D3k000000usr9!AQkAQO8Iq3VKKN4aOd6asUy'
    }
};

const readUserMock = {
    data: {
        firstname: 'Ajit',
        lastname: 'Pawarr',
        email: 'techajit@gmail.com',
        role: 'Read Only',
        roleId: 2,
        status: 'Active',
        twoFactorEnable: false,
        id: 12122435,
        timezone: 'UTC'
    }
};

const ro = {
    key: {
        simple: {
            id: '12122435'
        }
    },
    attributes: {
        id: '12122435',
        firstname: 'Ajit',
        lastname: 'Pawarr',
        email: 'techajit@gmail.com',
        role: 'Read Only',
        roleId: 2,
        status: 'Active',
        twoFactorEnable: false,
        timezone: 'UTC',
        lastLoginTime: undefined
    }
};

const gro = {
    key: {
        simple: {
            id: '1'
        }
    },
    attributes: {
        roleId: '1',
        label: 'Full Admin',
        organizationId: 0
    }
};

const listUsersMock = {
    data: [
        {
            firstname: 'Ajit',
            lastname: 'Pawarr',
            email: 'techajit@gmail.com',
            role: 'Read Only',
            roleId: 2,
            status: 'Active',
            twoFactorEnable: false,
            id: 12122435,
            timezone: 'UTC',
            lastLoginTime: '2023-01-11T13:00:42.000Z'
        },
        {
            firstname: 'alex',
            lastname: 'hales',
            email: 'alex11@gmail.com',
            role: 'Full Admin',
            roleId: 1,
            status: 'Active',
            twoFactorEnable: false,
            id: 12122448,
            timezone: 'UTC'
        }
    ]
};

const listGroupsMock = {
    data: [
        {
            organizationId: 0,
            label: 'Full Admin',
            roleId: 1
        }
    ]
};

const createUserMock = {
    data: {
        firstname: 'Ajit',
        lastname: 'Pawarr',
        email: 'techajit@gmail.com',
        role: 'Read Only',
        roleId: 2,
        status: 'Active',
        twoFactorEnable: false,
        id: 12122435,
        timezone: 'UTC'
    }
};

// api token mock
let getAPITokenRes: Promise<any> = Promise.resolve(tokenResMock);
const __setGetAPITokenMockResponse: any = (mockRes: Promise<any>) => {
    getAPITokenRes = mockRes;
};

// get user mock
let getUserRes: Promise<any> = Promise.resolve(readUserMock);
const __setGetUserMockResponse: any = (mockRes: Promise<any>) => {
    getUserRes = mockRes;
};

// list users mock
let listUsersRes: Promise<any> = Promise.resolve(listUsersMock);
const __setListUsersMockResponse: any = (mockRes: Promise<any>) => {
    listUsersRes = mockRes;
};

// list groups mock
let listGroupsRes: Promise<any> = Promise.resolve(listGroupsMock);
const __setListGroupsMockResponse: any = (mockRes: Promise<any>) => {
    listGroupsRes = mockRes;
};

// delete user mock
let deleteUserRes: Promise<any> = Promise.resolve();
const __setDeleteUserMockResponse: any = (mockRes: Promise<any>) => {
    deleteUserRes = mockRes;
};

let createUserRes: Promise<any> = Promise.resolve(createUserMock);
const __setCreateUserMockResponse: any = (mockRes: Promise<any>) => {
    createUserRes = mockRes;
};

const input = {};

jest.mock('../connector/cisco-umbrella-client', () => {
    return {
        interceptors: {
            request: { use: jest.fn(), eject: jest.fn() },
            response: { use: jest.fn(), eject: jest.fn() }
        },
        CiscoUmbrellaClient: jest.fn().mockImplementation(() => {
            return {
                testConnection: jest.fn().mockImplementation(() => {
                    return getAPITokenRes;
                }),
                readAccount: jest.fn().mockImplementation(() => {
                    return getUserRes;
                }),
                listUsers: jest.fn().mockImplementationOnce(() => {
                    return listUsersRes;
                }),
                listEntitlements: jest.fn().mockImplementation(() => {
                    return listGroupsRes;
                }),
                deleteUser: jest.fn().mockImplementation(() => {
                    return deleteUserRes;
                }),
                addUser: jest.fn().mockImplementation(() => {
                    return createUserRes;
                })
            };
        })
    };
});

/////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

describe('constructor', () => {
    test('[0] Cisco Umbrella for API token flow', async () => {
        const inst = new CiscoUmbrellaConnector(mockConfig);
        expect(inst).not.toBeUndefined();
    });
});

describe('testConnection', () => {
    let inst: CiscoUmbrellaConnector;
    let outStream: PassThrough;

    beforeEach(() => {
        inst = new CiscoUmbrellaConnector(mockConfig);
        outStream = new PassThrough({ objectMode: true });
    });

    test('[0] test connection success', async () => {
        await inst.testConnection(new ResponseStream<any>(outStream));

        outStream.on('data', chunk => {
            expect(chunk.data).toStrictEqual({});
        });
    });

    test('[1] unauthorized exception in test connection', () => {
        __setGetAPITokenMockResponse(Promise.reject(unauthorizedError));

        expect(
            inst.testConnection(new ResponseStream<any>(new PassThrough({ objectMode: true })))
        ).rejects.toThrowError('401 Unauthorized');
    });
});

describe('readAccount', () => {
    let inst: CiscoUmbrellaConnector;
    let outStream: PassThrough;

    const nativeIdentifier = {
        key: { simple: { id: '12122435' } }
    } as StdAccountReadInput;

    beforeEach(() => {
        inst = new CiscoUmbrellaConnector(mockConfig);
    });

    test('[0] read account success', async () => {
        __setGetUserMockResponse(Promise.resolve(readUserMock));
        //let response = await inst.readAccount(nativeIdentifier, new ResponseStream<any>(outStream));
        //expect(response).toMatchObject(ro);

        const outStream = new PassThrough({ objectMode: true });
        await inst.readAccount(nativeIdentifier, new ResponseStream<any>(outStream));

        outStream.on('data', chunk => expect(chunk.data).toMatchObject(ro));
    });

    test('[1] empty response in account read', () => {
        __setGetUserMockResponse(Promise.resolve(emptyRes));

        expect(
            inst.readAccount(nativeIdentifier, new ResponseStream<any>(new PassThrough({ objectMode: true })))
        ).rejects.toThrowError('Empty response for user resource retrieve.');
    });

    test('[2] exception in account read', () => {
        __setGetUserMockResponse(Promise.reject(unauthorizedError));

        expect(
            inst.readAccount(nativeIdentifier, new ResponseStream<any>(new PassThrough({ objectMode: true })))
        ).rejects.toThrowError('401 Unauthorized');
    });

    test('[3] empty native identifier', () => {
        expect(
            inst.readAccount(
                { identity: '', key: SimpleKey('') },
                new ResponseStream<any>(new PassThrough({ objectMode: true }))
            )
        ).rejects.toThrowError('Native identifier cannot be empty.');
    });
});

describe('listAccounts', () => {
    let inst: CiscoUmbrellaConnector;
    let outStream: PassThrough;

    beforeEach(() => {
        inst = new CiscoUmbrellaConnector(mockConfig);
    });

    test('[0] list accounts success', async () => {
        const outStream = new PassThrough({ objectMode: true });
        await inst.listAccounts(input, new ResponseStream<any>(outStream));
        outStream.on('data', (chunk: any) => {
            expect(chunk.data).toMatchSnapshot(ro);
        });
    });

    test('[1] exception list users', () => {
        __setListUsersMockResponse(Promise.reject(unauthorizedError));

        expect(
            inst.listAccounts(input, new ResponseStream<any>(new PassThrough({ objectMode: true })))
        ).rejects.toThrowError('401 Unauthorized');
    });
});

describe('listEntitlements', () => {
    let inst: CiscoUmbrellaConnector;
    let outStream: PassThrough;

    beforeEach(() => {
        inst = new CiscoUmbrellaConnector(mockConfig);
    });

    test('[0] list groups success', async () => {
        const outStream = new PassThrough({ objectMode: true });
        await inst.listEntitlements(new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: any) => expect(chunk.data).toMatchSnapshot(gro));
    });

    test('[1] empty response list groups', () => {
        __setListGroupsMockResponse(Promise.resolve(emptyRes));

        expect(
            inst.listEntitlements(new ResponseStream<any>(new PassThrough({ objectMode: true })))
        ).rejects.toThrowError('Found empty response for account list.');
    });

    test('[2] exception list groups', () => {
        __setListGroupsMockResponse(Promise.reject(unauthorizedError));

        expect(
            inst.listEntitlements(new ResponseStream<any>(new PassThrough({ objectMode: true })))
        ).rejects.toThrowError('401 Unauthorized');
    });
});

describe('deleteAccount', () => {
    let inst: CiscoUmbrellaConnector;
    let outStream: PassThrough;

    const nativeIdentifier = {
        key: { simple: { id: '12122435' } }
    } as StdAccountReadInput;

    beforeEach(() => {
        inst = new CiscoUmbrellaConnector(mockConfig);
        outStream = new PassThrough({ objectMode: true });
    });

    test('[0] delete account success', async () => {
        await inst.deleteAccount(nativeIdentifier, new ResponseStream<any>(outStream));

        outStream.on('data', chunk => {
            expect(chunk.data).toStrictEqual({});
        });
    });

    test('[1] exception in delete account', () => {
        __setDeleteUserMockResponse(Promise.reject(unauthorizedError));

        expect(inst.deleteAccount(nativeIdentifier, new ResponseStream<any>(outStream))).rejects.toThrowError(
            '401 Unauthorized'
        );
    });

    test('[3] empty native identifier', () => {
        expect(
            inst.deleteAccount(
                { identity: '', key: SimpleKey('') },
                new ResponseStream<any>(new PassThrough({ objectMode: true }))
            )
        ).rejects.toThrowError('Native identifier cannot be empty.');
    });
});

describe('createAccount', () => {
    let inst: CiscoUmbrellaConnector;
    let accountInput: StdAccountCreateInput = {
        identity: '',
        attributes: {
            email: 'techajit@gmail.com',
            firstname: 'Ajit',
            lastname: 'Pawar',
            roleId: 2,
            password: 'Trialaccount@123',
            timezone: 'UTC'
        }
    } as StdAccountCreateInput;

    let accountInputNoLastName: StdAccountCreateInput = {
        identity: '',
        attributes: {
            email: 'techajit@gmail.com',
            firstname: 'Ajit',
            roleId: 2,
            password: 'Trialaccount@123',
            timezone: 'UTC'
        }
    } as StdAccountCreateInput;

    let accountInputNoName: StdAccountCreateInput = {
        identity: '',
        attributes: {
            email: 'techajit@gmail.com',
            lastname: 'Pawar',
            roleId: 2,
            password: 'Trialaccount@123',
            timezone: 'UTC'
        }
    } as StdAccountCreateInput;

    let accountInputNoRole: StdAccountCreateInput = {
        identity: '',
        attributes: {
            email: 'techajit@gmail.com',
            firstname: 'Ajit',
            lastname: 'Pawar',
            password: 'Trialaccount@123',
            timezone: 'UTC'
        }
    } as StdAccountCreateInput;

    let accountInputNoPassword: StdAccountCreateInput = {
        identity: '',
        attributes: {
            email: 'techajit@gmail.com',
            firstname: 'Ajit',
            lastname: 'Pawar',
            roleId: 2,
            timezone: 'UTC'
        }
    } as StdAccountCreateInput;

    let accountInputNoTimezone: StdAccountCreateInput = {
        identity: '',
        attributes: {
            email: 'techajit@gmail.com',
            firstname: 'Ajit',
            lastname: 'Pawar',
            roleId: 2,
            password: 'Trialaccount@123'
        }
    } as StdAccountCreateInput;

    let accountInputNoEmail: StdAccountCreateInput = {
        identity: '',
        attributes: {
            firstname: 'Ajit',
            lastname: 'Pawar',
            roleId: 2,
            password: 'Trialaccount@123',
            timezone: 'UTC'
        }
    } as StdAccountCreateInput;

    beforeEach(() => {
        inst = new CiscoUmbrellaConnector(mockConfig);
        __setCreateUserMockResponse(Promise.resolve(createUserMock));
        __setGetUserMockResponse(Promise.resolve(readUserMock));
    });

    test('[0] create account success', async () => {
        __setCreateUserMockResponse(Promise.resolve(createUserMock));
        __setGetUserMockResponse(Promise.resolve(readUserMock));

        const outStream = new PassThrough({ objectMode: true });
        const response = await inst.createAccount(accountInput, new ResponseStream<any>(outStream));

        outStream.on('data', (chunk: any) => {
            expect(chunk.data).toMatchObject(ro);
        });
    });

    test('[1] exception in account create', () => {
        __setCreateUserMockResponse(Promise.reject(unauthorizedError));

        const outStream = new PassThrough({ objectMode: true });

        expect(inst.createAccount(accountInput, new ResponseStream<any>(outStream))).rejects.toThrowError(
            '401 Unauthorized'
        );
    });

    test('[2] account create without firstname', () => {
        __setCreateUserMockResponse(Promise.resolve(emptyRes));

        const outStream = new PassThrough({ objectMode: true });

        expect(inst.createAccount(accountInputNoName, new ResponseStream<any>(outStream))).rejects.toThrowError(
            'Required attribute firstname is either null or empty'
        );
    });

    test('[3] account create without role', () => {
        __setCreateUserMockResponse(Promise.resolve(emptyRes));

        const outStream = new PassThrough({ objectMode: true });

        expect(inst.createAccount(accountInputNoRole, new ResponseStream<any>(outStream))).rejects.toThrowError(
            'Required attribute role is either null or empty'
        );
    });

    test('[4] account create without lastname', () => {
        __setCreateUserMockResponse(Promise.resolve(emptyRes));

        const outStream = new PassThrough({ objectMode: true });

        expect(inst.createAccount(accountInputNoLastName, new ResponseStream<any>(outStream))).rejects.toThrowError(
            'Required attribute lastname is either null or empty'
        );
    });

    test('[5] account create without password', () => {
        __setCreateUserMockResponse(Promise.resolve(emptyRes));

        const outStream = new PassThrough({ objectMode: true });

        expect(inst.createAccount(accountInputNoPassword, new ResponseStream<any>(outStream))).rejects.toThrowError(
            'Required attribute password is either null or empty'
        );
    });

    test('[6] account create without timezone', () => {
        __setCreateUserMockResponse(Promise.resolve(emptyRes));

        const outStream = new PassThrough({ objectMode: true });

        expect(inst.createAccount(accountInputNoTimezone, new ResponseStream<any>(outStream))).rejects.toThrowError(
            'Required attribute timezone is either null or empty'
        );
    });

    test('[7] account create without email', () => {
        __setCreateUserMockResponse(Promise.resolve(emptyRes));

        const outStream = new PassThrough({ objectMode: true });

        expect(inst.createAccount(accountInputNoEmail, new ResponseStream<any>(outStream))).rejects.toThrowError(
            'Required attribute email is either null or empty'
        );
    });

    test('[8] empty response for account create', () => {
        __setCreateUserMockResponse(Promise.resolve(emptyRes));

        const outStream = new PassThrough({ objectMode: true });

        expect(inst.createAccount(accountInput, new ResponseStream<any>(outStream))).rejects.toThrowError(
            'Found empty response for user creation.'
        );
    });
});
