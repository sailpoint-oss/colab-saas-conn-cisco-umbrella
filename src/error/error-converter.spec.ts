/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */
import { AxiosError, AxiosResponse } from 'axios';
import { convertToConnectorError } from '.';

/////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////

describe('http errors', () => {
    test('[0] http 400 error code', () => {
        const error = new Error() as AxiosError;
        error.isAxiosError = true;
        error.response = {
            status: '400',
            data: { code: 400, message: 'Bad Request' }
        } as any;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('400');
    });

    test('[1] http 401 error code', () => {
        const error = new Error() as AxiosError;
        error.isAxiosError = true;
        error.response = {
            status: '401',
            data: { code: 401, message: 'Unauthorized' }
        } as any;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('401');
    });

    test('[2] http 403 error code', () => {
        const error = new Error() as AxiosError;
        error.isAxiosError = true;
        error.response = {
            status: '403',
            data: { code: 403, message: 'Forbidden' }
        } as any;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('403');
    });

    test('[3] http 404 error code', () => {
        const error = new Error() as AxiosError;
        error.isAxiosError = true;
        error.response = {
            status: '404',
            data: { code: 404, message: 'Not Found' }
        } as any;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('404');
    });

    test('[4] http 409 error code', () => {
        const error = new Error() as AxiosError;
        error.isAxiosError = true;
        error.response = {
            status: '409',
            data: { code: 409, message: 'Conflict' }
        } as any;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('409');
    });

    test('[5] http 500 error code', () => {
        const error = new Error() as AxiosError;
        error.isAxiosError = true;
        error.response = {
            status: '500',
            data: { code: 500, message: 'Internal Server Error' }
        } as any;

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('500');
    });

    test('[6] user not found', () => {
        const error = new Error('User not found');

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('User not found');
    });

    test('[7] user not found', () => {
        const error = new Error('User not found');

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('User not found');
    });
});

describe('Wire errors', () => {
    test('[0] host not found', () => {
        const error = {
            errno: -3008,
            code: 'ENOTFOUND',
            syscall: 'getaddrinfo',
            hostname: 'demo.docusign1.net',
            message: 'getaddrinfo ENOTFOUND demo.docusign1.net'
        };

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('Unknown host. message: getaddrinfo ENOTFOUND demo.docusign1.net');
    });

    test('[1] unknown wire error', () => {
        const error = {
            code: 'UNKNOWN_ERROR',
            message: 'Unknown error'
        };

        expect(() => {
            convertToConnectorError(error);
        }).toThrow();
    });

    test('[0] host not found', () => {
        const error = {
            errno: -3008,
            code: 'ECONNREFUSED',
            syscall: 'getaddrinfo',
            hostname: 'demo.docusign1.net',
            message: 'getaddrinfo ENOTFOUND demo.docusign1.net'
        };

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('Connection refused. message:');
    });
});

describe('other errors', () => {
    test('[0] random error', () => {
        let error = 'User already exists';

        expect(() => {
            convertToConnectorError(error);
        }).toThrowError('User already exists');
    });
});
