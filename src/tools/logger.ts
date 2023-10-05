/* Copyright (c) 2023. SailPoint Technologies, Inc. All rights reserved. */
import { logger as SDKLogger } from '@sailpoint/connector-sdk';

export const logger = SDKLogger.child(
    // specify your connector name
    { AppType: 'Cisco Umbrella', timestamp: `${new Date(Date.now()).toISOString()}` },
    // This is optional for  removing specific information you might not want to be logged
    {
        redact: {
            paths: ['err.cause.config.headers.Authorization'],
            censor: '****'
        }
    }
);
