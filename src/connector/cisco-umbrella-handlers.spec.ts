/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import {
    Context,
    ResponseStream,
    StdAccountCreateInput,
    StdAccountDeleteInput,
    StdAccountDisableInput,
    StdAccountListInput,
    StdAccountEnableInput,
    StdAccountReadInput,
    StdAccountUpdateInput,
    StdEntitlementListInput
} from '@sailpoint/connector-sdk';
import { CiscoUmbrellaConfig, CiscoUmbrellaConnector, validateConfig } from '.';
import { PassThrough } from 'stream';

//////////////////////////////////////////////////////////////////////
//
// cisco-umbrella-handlers.ts initialization prerequisites
//
//////////////////////////////////////////////////////////////////////

// source configuration
const mockConfig = {
    apiKey: 'cbzrVi4ejeYFHPZvSyZGsX',
    keySecret: '1MGO5QjZiRjZjdTMtImM3gTL5QDZ00SMilzMtIGN2UTZ4YWYiJjY1Q2MwU2Y2ADMtUjYzkTLmZWO00iZ5EjYtATYzAjY1I2M'
} as CiscoUmbrellaConfig;

// set config in node process env
process.env.CONNECTOR_CONFIG = Buffer.from(JSON.stringify(mockConfig), 'utf-8').toString('base64');

const mockCreateUserInput = {
    attributes: {
        email: 'xyz@gmail.com',
        firstname: 'xyz',
        lastname: 'zxy',
        roleId: 2,
        password: 'Trialaccount@123',
        timezone: 'UTC'
    }
};

//////////////////////////////////////////////////////////////////////
//
// LATE IMPORTS
//
//////////////////////////////////////////////////////////////////////

import * as CiscoUmbrellaHandler from '../connector';
import { InvalidConfigurationError } from '../error';

//////////////////////////////////////////////////////////////////////
//
// COMMON CONSTANTS
//
//////////////////////////////////////////////////////////////////////
const mockContext = {
    id: '964265dd-643e-4675-b097-4743ab883902',
    name: 'Cisco-Umbrella',
    version: 1.0
} as Context;

const mockInput = {
    key: { simple: { id: '100' } }
};

//////////////////////////////////////////////////////////////////////
//
// CiscoUmbrellaConnector MOCKS
//
//////////////////////////////////////////////////////////////////////
const operationSuccess = (): void => {
    return;
};

const operationFailsWithConnectorError = (): void => {
    throw new InvalidConfigurationError('401 Unauthorized');
};
const operationFailsWithOtherError = (): void => {
    throw new Error('All hell broke loose.');
};

const input = {} as StdAccountListInput;

jest.mock('./cisco-umbrella-connector', () => {
    return {
        CiscoUmbrellaConnector: jest.fn().mockImplementation(() => {
            return {
                testConnection: jest
                    .fn()
                    .mockImplementationOnce(() => {
                        operationSuccess();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithConnectorError();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithOtherError();
                    }),
                readAccount: jest
                    .fn()
                    .mockImplementationOnce(() => {
                        operationSuccess();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithConnectorError();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithOtherError();
                    }),
                listAccounts: jest
                    .fn()
                    .mockImplementationOnce(() => {
                        operationSuccess();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithConnectorError();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithOtherError();
                    }),
                deleteAccount: jest
                    .fn()
                    .mockImplementationOnce(() => {
                        operationSuccess();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithConnectorError();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithOtherError();
                    }),
                listEntitlements: jest
                    .fn()
                    .mockImplementationOnce(() => {
                        operationSuccess();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithConnectorError();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithOtherError();
                    }),
                createAccount: jest
                    .fn()
                    .mockImplementationOnce(() => {
                        operationSuccess();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithConnectorError();
                    })
                    .mockImplementationOnce(() => {
                        operationFailsWithOtherError();
                    })
            };
        })
    };
});

//////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////
describe('configuration validation', () => {
    test('[0] missing keySecret', () => {
        const fakeConfig = {
            apiKey: '5d8ef551-ef60-4749-b0ba-9a60b72d591d'
        };

        expect(() => {
            validateConfig(fakeConfig);
        }).toThrowError(`'keySecret' is required`);
    });

    test('[1] missing apiKey', () => {
        const fakeConfig = {
            keyScret: '5d8ef551-ef60-4749-b0ba-9a60b72d591d'
        };

        expect(() => {
            validateConfig(fakeConfig);
        }).toThrowError(`'apiKey' is required`);
    });
});

describe('CiscoUmbrella constructor', () => {
    let inst;

    beforeEach(() => {
        inst = new CiscoUmbrellaConnector(mockConfig);
    });

    test('[0] CiscoumbrellaConnector called', async () => {
        expect(CiscoUmbrellaConnector).toHaveBeenCalled();
        expect(CiscoUmbrellaConnector).toHaveBeenCalledTimes(1);
    });

    test('[1] CiscoUmbrellaConnector called with', async () => {
        expect(CiscoUmbrellaConnector).toHaveBeenCalledWith(mockConfig);
    });
});

describe('stdTestConnectionHandler', () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test('[0] test connection success', () => {
        expect(CiscoUmbrellaHandler.stdTestConnectionHandler(mockContext, undefined, res)).resolves.toBeUndefined();
    });

    test('[1] connector error in test', async () => {
        expect(CiscoUmbrellaHandler.stdTestConnectionHandler(mockContext, undefined, res)).rejects.toThrowError(
            '401 Unauthorized'
        );
    });

    test('[2] unknown error in test', async () => {
        expect(CiscoUmbrellaHandler.stdTestConnectionHandler(mockContext, undefined, res)).rejects.toThrowError(
            'All hell broke loose.'
        );
    });
});

describe('stdAccountReadHandler', () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test('[0] read account success', () => {
        expect(
            CiscoUmbrellaHandler.stdAccountReadHandler(mockContext, mockInput as StdAccountReadInput, res)
        ).resolves.toBeUndefined();
    });

    test('[1] connector error in read account', async () => {
        expect(
            CiscoUmbrellaHandler.stdAccountReadHandler(mockContext, mockInput as StdAccountReadInput, res)
        ).rejects.toThrowError('401 Unauthorized');
    });

    test('[2] unknown error in read account', async () => {
        expect(
            CiscoUmbrellaHandler.stdAccountReadHandler(mockContext, mockInput as StdAccountReadInput, res)
        ).rejects.toThrowError('All hell broke loose.');
    });
});

describe('stdAccountListHandler', () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test('[0] list account success', () => {
        expect(CiscoUmbrellaHandler.stdAccountListHandler(mockContext, input, res)).resolves.toBeUndefined();
    });

    test('[1] connector error in list account', async () => {
        expect(CiscoUmbrellaHandler.stdAccountListHandler(mockContext, input, res)).rejects.toThrowError(
            '401 Unauthorized'
        );
    });

    test('[2] unknown error in list account', async () => {
        expect(CiscoUmbrellaHandler.stdAccountListHandler(mockContext, input, res)).rejects.toThrowError(
            'All hell broke loose.'
        );
    });
});

describe('stdAccountDeleteHandler', () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test('[0] delete account success', () => {
        expect(
            CiscoUmbrellaHandler.stdAccountDeleteHandler(mockContext, mockInput as StdAccountDeleteInput, res)
        ).resolves.toBeUndefined();
    });

    test('[1] connector error in delete account', async () => {
        expect(
            CiscoUmbrellaHandler.stdAccountDeleteHandler(mockContext, mockInput as StdAccountDeleteInput, res)
        ).rejects.toThrowError('401 Unauthorized');
    });

    test('[2] unknown error in delete account', async () => {
        expect(
            CiscoUmbrellaHandler.stdAccountDeleteHandler(mockContext, mockInput as StdAccountDeleteInput, res)
        ).rejects.toThrowError('All hell broke loose.');
    });
});

describe('stdEntitlementListHandler', () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test('[0] list role success', () => {
        expect(
            CiscoUmbrellaHandler.stdEntitlementListHandler(mockContext, { type: 'group' }, res)
        ).resolves.toBeUndefined();
    });

    test('[1] connector error in list account', async () => {
        expect(
            CiscoUmbrellaHandler.stdEntitlementListHandler(mockContext, { type: 'group' }, res)
        ).rejects.toThrowError('401 Unauthorized');
    });

    test('[2] unknown error in list account', async () => {
        expect(
            CiscoUmbrellaHandler.stdEntitlementListHandler(mockContext, { type: 'group' }, res)
        ).rejects.toThrowError('All hell broke loose.');
    });
});

describe('stdAccountCreateHandler', () => {
    let res: ResponseStream<any>;

    beforeEach(() => {
        res = new ResponseStream<any>(new PassThrough({ objectMode: true }));
    });

    test('[0] create account success', () => {
        expect(
            CiscoUmbrellaHandler.stdAccountCreateHandler(mockContext, mockCreateUserInput as StdAccountCreateInput, res)
        ).resolves.toBeUndefined();
    });

    test('[1] connector error in create account', async () => {
        expect(
            CiscoUmbrellaHandler.stdAccountCreateHandler(mockContext, mockCreateUserInput as StdAccountCreateInput, res)
        ).rejects.toThrowError('401 Unauthorized');
    });

    test('[2] unknown error in create account', async () => {
        expect(
            CiscoUmbrellaHandler.stdAccountCreateHandler(mockContext, mockCreateUserInput as StdAccountCreateInput, res)
        ).rejects.toThrowError('All hell broke loose.');
    });
});
