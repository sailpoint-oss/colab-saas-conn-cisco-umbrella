/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import { ConnectorError as SdkConnectorError, ConnectorErrorType } from '@sailpoint/connector-sdk';

/**
 * A generic error is thrown by connectors when operations fail. This usually
 * indicates some problem with the underlying resource or the data passed to
 * the resource.
 */
export class ConnectorError extends SdkConnectorError {
    /**
     * cause of exception
     */
    public cause: Error | undefined;

    /**
     * Constructor
     * @param message
     * @param cause
     */
    constructor(message: string, cause?: Error | undefined, type = ConnectorErrorType.Generic) {
        super(message, type);
        this.cause = cause;
        this.name = 'ConnectorError';
    }
}
