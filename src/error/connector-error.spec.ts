/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import {
    ConnectorError,
    InvalidRequestError,
    InvalidConfigurationError,
    InvalidResponseError,
    InsufficientPermissionError
} from '.';

describe('ConnectorError', () => {
    let inst: ConnectorError;

    beforeEach(() => {
        inst = new ConnectorError('Ran out of iterations', {
            name: '/dummy_name',
            message: 'Wait time out reached, while waiting for results',
            stack: 'The line-by-line profiler can only be used in dev.'
        });
    });

    test('0', () => {
        expect(inst.name).toStrictEqual('ConnectorError');
    });

    test('1', () => {
        expect(inst.message).toStrictEqual('Ran out of iterations');
    });

    test('2', () => {
        expect(inst.stack).toContain('ConnectorError: Ran out of iterations');
    });

    test('3', () => {
        expect(inst.cause?.name).toStrictEqual('/dummy_name');
    });

    test('4', () => {
        expect(inst.cause?.message).toStrictEqual('Wait time out reached, while waiting for results');
    });

    test('5', () => {
        expect(inst.cause?.stack).toStrictEqual('The line-by-line profiler can only be used in dev.');
    });
});

describe('InsufficientPermissionError', () => {
    let inst: InsufficientPermissionError;

    beforeEach(() => {
        inst = new InsufficientPermissionError('Insufficient permissions detected.', {
            name: '/forbidden',
            message: '403 Forbidden',
            stack: 'Access token with inadequate scope.'
        });
    });

    test('0', () => {
        expect(inst.name).toStrictEqual('InsufficientPermissionError');
    });

    test('1', () => {
        expect(inst.message).toStrictEqual('Insufficient permissions detected.');
    });

    test('2', () => {
        expect(inst.stack).toContain('InsufficientPermissionError: Insufficient permissions detected.');
    });

    test('3', () => {
        expect(inst.cause?.name).toStrictEqual('/forbidden');
    });

    test('4', () => {
        expect(inst.cause?.message).toStrictEqual('403 Forbidden');
    });

    test('5', () => {
        expect(inst.cause?.stack).toStrictEqual('Access token with inadequate scope.');
    });
});

describe('InvalidConfigurationError', () => {
    let inst: InvalidConfigurationError;

    beforeEach(() => {
        inst = new InvalidConfigurationError(
            'Unable to find your git executable - Shutdown SickBeard and EITHER <a href="http://code.google.com/p/sickbeard/wiki/AdvancedSettings" onclick="window.open(this.href); return false;">set git_path in your config.ini</a> OR delete your .git folder and run from source to enable updates.',
            { name: '/dummyName', message: 'missing encoding', stack: 'There is a mismatch' }
        );
    });

    test('0', () => {
        expect(inst.name).toStrictEqual('InvalidConfigurationError');
    });

    test('1', () => {
        expect(inst.message).toContain('Unable to find your git executable - Shutdown SickBeard and EITHER');
    });

    test('2', () => {
        expect(inst.stack).toContain('InvalidConfigurationError: Unable to find your git executable -');
    });

    test('3', () => {
        expect(inst.cause?.name).toStrictEqual('/dummyName');
    });

    test('4', () => {
        expect(inst.cause?.message).toStrictEqual('missing encoding');
    });

    test('5', () => {
        expect(inst.cause?.stack).toStrictEqual('There is a mismatch');
    });
});

describe('InvalidRequestError', () => {
    let inst: InvalidRequestError;

    beforeEach(() => {
        inst = new InvalidRequestError('Uploaded file was not added to the resource. ', {
            name: 'dummyname',
            message: 'Wait time out reached, while waiting for results',
            stack: 'There is a mismatch'
        });
    });

    test('0', () => {
        expect(inst.name).toStrictEqual('InvalidRequestError');
    });

    test('1', () => {
        expect(inst.message).toStrictEqual('Uploaded file was not added to the resource. ');
    });

    test('2', () => {
        expect(inst.stack).toContain('InvalidRequestError: Uploaded file was not added to the resource. ');
    });

    test('3', () => {
        expect(inst.cause?.name).toStrictEqual('dummyname');
    });

    test('4', () => {
        expect(inst.cause?.message).toStrictEqual('Wait time out reached, while waiting for results');
    });

    test('5', () => {
        expect(inst.cause?.stack).toStrictEqual('There is a mismatch');
    });
});

describe('InvalidResponseError', () => {
    let inst: InvalidResponseError;

    beforeEach(() => {
        inst = new InvalidResponseError('Invalid response received. ', {
            name: '/invalidresponse',
            message: 'cannot parse the response.',
            stack: 'There is a mismatch in response format'
        });
    });

    test('0', () => {
        expect(inst.name).toStrictEqual('InvalidResponseError');
    });

    test('1', () => {
        expect(inst.message).toStrictEqual('Invalid response received. ');
    });

    test('2', () => {
        expect(inst.stack).toContain('InvalidResponseError: Invalid response received. ');
    });

    test('3', () => {
        expect(inst.cause?.name).toStrictEqual('/invalidresponse');
    });

    test('4', () => {
        expect(inst.cause?.message).toStrictEqual('cannot parse the response.');
    });

    test('5', () => {
        expect(inst.cause?.stack).toStrictEqual('There is a mismatch in response format');
    });
});
