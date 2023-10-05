/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import { Connector, createConnector } from '@sailpoint/connector-sdk';
import {
    stdTestConnectionHandler,
    stdAccountReadHandler,
    stdAccountListHandler,
    stdEntitlementListHandler,
    stdAccountDeleteHandler,
    stdAccountCreateHandler
} from './connector';

export const connector: Connector = createConnector()
    .stdTestConnection(stdTestConnectionHandler)
    .stdAccountRead(stdAccountReadHandler)
    .stdAccountList(stdAccountListHandler)
    .stdEntitlementList(stdEntitlementListHandler)
    .stdAccountDelete(stdAccountDeleteHandler)
    .stdAccountCreate(stdAccountCreateHandler);
