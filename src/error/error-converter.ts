/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import { AxiosError } from 'axios';
import { ConnectorError, InsufficientPermissionError, InvalidConfigurationError, InvalidRequestError } from '.';

/**
 * Convert error to an appropriate ConnectorError.
 *
 * @param {Error | any} error - An error object.
 */
export const convertToConnectorError = (error: Error | any): void => {
    if (error instanceof Error) {
        // http errors
        const err = error as AxiosError;
        const errorMessage = `${err?.code}, ${err?.message}, ${err?.response?.statusText}, ${err?.response?.data}`;
        if (err.response && err.response.status) {
            const status = err.response.status;
            if (status == 400) {
                throw new InvalidRequestError(`${status} ${errorMessage}`, err);
            } else if (status == 401) {
                throw new InvalidConfigurationError(`${status} Unauthorized`, err);
            } else if (status == 403) {
                throw new InsufficientPermissionError(`${status} ${errorMessage}`, err);
            } else if (status == 404) {
                throw new InvalidRequestError(`${status} ${errorMessage}`, err);
            } else if (status == 409) {
                throw new InvalidRequestError(`${status} ${errorMessage}`, err);
            } else {
                throw new ConnectorError(`${status} ${errorMessage}`, err);
            }
        } else {
            throw new ConnectorError(err.message, err);
        }
    } else if (error.code) {
        // wire errors
        if (error.code == 'ENOTFOUND') {
            throw new InvalidConfigurationError(
                `Unknown host. message: ${error.message} , errno: ${error.errno} , code: ${error.code}`,
                error
            );
        }

        if (error.code == 'ECONNREFUSED') {
            throw new InvalidConfigurationError(
                `Connection refused. message: ${error.message} , errno: ${error.errno} , code: ${error.code}`,
                error
            );
        }

        throw new ConnectorError(error);
    } else {
        throw new ConnectorError(error);
    }
};
