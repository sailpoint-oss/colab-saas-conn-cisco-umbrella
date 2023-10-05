/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */
import axios, { AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { CiscoUmbrellaClient } from '.';

//////////////////////////////////////////////////////////////////////
//
// GLOBAL CONSTANTS
//
//////////////////////////////////////////////////////////////////////

const mockConfig = {
    apiKey: 'a510773041254276925765f46f92e443',
    keySecret: 'e15a847d217c4b14b25dc5c90f2f3065'
};

const accsessToken = 'abc';

const gettoken = {
    data: {
        access_token: 'abc'
    }
};

//////////////////////////////////////////////////////////////////////
//
// AXIOS MOCKS
//
//////////////////////////////////////////////////////////////////////

let axiosRes: Promise<any> = Promise.resolve();
let axiosPostRes: Promise<any> = Promise.resolve();
const error = new Error() as AxiosError;
error.isAxiosError = true;
error.response = {
    status: '429',
    data: { code: 429, message: 'Too Many Requests' }
} as any;

const __setAxiosMockResponse: any = (mockRes: Promise<any>) => {
    axiosRes = mockRes;
};
const __setPostMockResponse: any = (mockRes: Promise<any>) => {
    axiosPostRes = mockRes;
};

jest.mock('axios', () => {
    return {
        create: jest.fn().mockImplementation(() => {
            return {
                get: jest.fn().mockImplementation(() => {
                    return axiosRes;
                }),
                post: jest
                    .fn()
                    .mockImplementationOnce(() => {
                        return axiosPostRes;
                    })
                    .mockImplementationOnce(() => {
                        return axiosRes;
                    }),
                delete: jest.fn().mockImplementation(() => {
                    return axiosRes;
                }),
                interceptors: {
                    request: { use: jest.fn(), eject: jest.fn() },
                    response: { use: jest.fn(), eject: jest.fn() }
                }
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
    beforeEach(() => {
        __setPostMockResponse(Promise.resolve(gettoken));
    });
    test('Cisco Umbrella constructor', async () => {
        const inst = new CiscoUmbrellaClient(mockConfig);

        let result: any = await inst.generateAPIToken(false);
        expect(result).not.toBeUndefined();
    });
});

describe('Test Connection', () => {
    let inst: CiscoUmbrellaClient;

    beforeEach(() => {
        inst = new CiscoUmbrellaClient(mockConfig);
    });

    test('[0] test connection success', async () => {
        const result: any = await inst.testConnection();
        expect(inst).not.toBeUndefined();
        expect(result).toBeUndefined();
    });
});

describe('getUserAccount', () => {
    let inst: CiscoUmbrellaClient;
    const userId = 12122435;

    beforeEach(() => {
        inst = new CiscoUmbrellaClient(mockConfig);
    });

    test('[0] get user', async () => {
        __setPostMockResponse(Promise.resolve(gettoken));
        __setAxiosMockResponse(Promise.resolve(readUserMock));

        const result: any = await inst.readAccount(userId);
        expect(result.data).not.toBeUndefined();
        expect(result.data.id).toStrictEqual(userId);
    });
});

describe('listUsers', () => {
    let inst: CiscoUmbrellaClient;

    beforeEach(() => {
        inst = new CiscoUmbrellaClient(mockConfig);
    });

    test('[0] list users', async () => {
        __setPostMockResponse(Promise.resolve(gettoken));
        __setAxiosMockResponse(Promise.resolve(listUsersMock));
        const result: any = await inst.listUsers(1, 200);
        expect(result.data).not.toBeUndefined();
        expect(result.data.length).toBe(2);
    });
});

describe('listRoles', () => {
    let inst: CiscoUmbrellaClient;
    const userId = '100';

    beforeEach(() => {
        inst = new CiscoUmbrellaClient(mockConfig);
    });

    test('[0] get user', async () => {
        __setPostMockResponse(Promise.resolve(gettoken));
        __setAxiosMockResponse(Promise.resolve(listGroupsMock));

        const result: any = await inst.listEntitlements();
        expect(result.data).not.toBeUndefined();
        expect(result.data.length).toStrictEqual(1);
    });
});

describe('Delete User', () => {
    let inst: CiscoUmbrellaClient;

    const id = '100';

    beforeEach(() => {
        inst = new CiscoUmbrellaClient(mockConfig);
    });

    test('[0] delete account success', async () => {
        __setPostMockResponse(Promise.resolve(gettoken));
        __setAxiosMockResponse(Promise.resolve());

        const result: any = await inst.deleteUser(id);
        expect(result).not.toStrictEqual({});
    });
});

describe('createUser', () => {
    let inst: CiscoUmbrellaClient;
    const payload = {
        email: 'techajit@gmail.com',
        firstname: 'Ajit',
        lastname: 'Pawar',
        roleId: 2,
        password: 'Trialaccount@123',
        timezone: 'UTC'
    };

    beforeEach(() => {
        inst = new CiscoUmbrellaClient(mockConfig);
    });

    test('[0] create account', async () => {
        __setPostMockResponse(Promise.resolve(gettoken));
        __setAxiosMockResponse(Promise.resolve(createUserMock));

        const result: any = await inst.addUser(payload);
        expect(result.data).not.toBeUndefined();
        expect(result.data.email).toStrictEqual('techajit@gmail.com');
    });
});

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
