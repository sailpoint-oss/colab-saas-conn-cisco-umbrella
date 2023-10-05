/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import { connector } from './index';

//////////////////////////////////////////////////////////////////////
//
// TESTS
//
//////////////////////////////////////////////////////////////////////
describe('connector is instantiated', () => {
    test('[0] create connector is called', () => {
        expect(connector).not.toBeNull();
        expect(connector).not.toBeUndefined();
    });
});
