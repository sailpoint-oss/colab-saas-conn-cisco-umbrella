/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */
import {
    Context,
    readConfig,
    Response,
    StdTestConnectionHandler,
    StdTestConnectionOutput,
    StdAccountReadInput,
    StdAccountReadOutput,
    StdAccountReadHandler,
    StdAccountListHandler,
    StdAccountListInput,
    StdAccountListOutput,
    StdEntitlementListHandler,
    StdEntitlementListInput,
    StdEntitlementListOutput,
    StdAccountDeleteHandler,
    StdAccountDeleteInput,
    StdAccountDeleteOutput,
    KeyID,
    StdAccountCreateHandler,
    StdAccountCreateInput,
    StdAccountCreateOutput
} from '@sailpoint/connector-sdk';

import { logger } from '../tools';
import { CiscoUmbrellaConnector } from '.';
import { ConnectorError, InvalidConfigurationError } from '../error';

export const validateConfig = (config: any): any => {
    if (!config.apiKey) {
        throw new InvalidConfigurationError(`'apiKey' is required`);
    }

    if (!config.keySecret) {
        throw new InvalidConfigurationError(`'keySecret' is required`);
    }
    return config;
};

let conn: CiscoUmbrellaConnector;

const getCiscoUmbrellaConnector = async (): Promise<CiscoUmbrellaConnector> => {
    if (!conn) {
        logger.debug('Instantiate new Cisco Umbrella connector');

        const config = await readConfig();
        conn = new CiscoUmbrellaConnector(validateConfig(config));
    }

    return conn;
};

/**
 * Test connection handler.
 *
 * @param {Context} context - source configuration.
 * @param {undefined} input - none.
 * @param {Response<StdTestConnectionOutput>} res - stream to write operation responses.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdTestConnectionHandler: StdTestConnectionHandler = async (
    context: Context,
    input: undefined,
    res: Response<StdTestConnectionOutput>
): Promise<void> => {
    const ciscoConnector = await getCiscoUmbrellaConnector();
    try {
        logger.debug('Performing Test Connection');
        await ciscoConnector.testConnection(res);
    } catch (error) {
        logAndRethrowError(error as Error, 'Test Connection Failed.');
    }
};

/**
 * User account read handler.
 *
 * @param {Context} context - Source configuration.
 * @param {StdAccountReadInput} input - User account read input parameters.
 * @param {Response<StdAccountReadOutput>} res - stream to write operation response.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdAccountReadHandler: StdAccountReadHandler = async (
    context: Context,
    input: StdAccountReadInput,
    res: Response<StdAccountReadOutput>
): Promise<void> => {
    const ciscoConnector = await getCiscoUmbrellaConnector();
    try {
        await ciscoConnector.readAccount(input, res);
    } catch (error) {
        logAndRethrowError(error as Error, `Read account failed for: ${KeyID(input)}`);
    }
};

/**
 * Account aggregation handler.
 *
 * @param {Context} context - source configuration.
 * @param {undefined} input - none.
 * @param {Response<StdAccountListOutput>} res - stream to write operation responses.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdAccountListHandler: StdAccountListHandler = async (
    context: Context,
    input: StdAccountListInput,
    res: Response<StdAccountListOutput>
): Promise<void> => {
    const ciscoConnector = await getCiscoUmbrellaConnector();
    try {
        logger.debug('Performing Account Aggregation');
        await ciscoConnector.listAccounts(input, res);
    } catch (error) {
        logAndRethrowError(error as Error, 'Account aggregation failed.');
    }
};

/**
 * Entitlement aggregation handler.
 *
 * Aggregates entitlements of type group.
 *
 * @param {Context} context - Source configuration.
 * @param {StdEntitlementListInput} input - type of entitlement to aggregate.
 * @param {Response<StdEntitlementListOutput>} res - stream to write operation responses.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdEntitlementListHandler: StdEntitlementListHandler = async (
    context: Context,
    input: StdEntitlementListInput,
    res: Response<StdEntitlementListOutput>
): Promise<void> => {
    const ciscoConnector = await getCiscoUmbrellaConnector();

    try {
        await ciscoConnector.listEntitlements(res);
    } catch (error) {
        logAndRethrowError(error as Error, 'Entitlement aggregation failed.');
    }
};

/**
 * User account deletion handler.
 *
 * @param {Context} context - Source configuration.
 * @param {StdAccountDeleteInput} input - User account deletion input parameters.
 * @param {Response<StdAccountDeleteOutput>} res - Stream to write operation response.
 */
export const stdAccountDeleteHandler: StdAccountDeleteHandler = async (
    context: Context,
    input: StdAccountDeleteInput,
    res: Response<StdAccountDeleteOutput>
): Promise<void> => {
    const ciscoConnector = await getCiscoUmbrellaConnector();
    try {
        await ciscoConnector.deleteAccount(input, res);
    } catch (error) {
        logAndRethrowError(error as Error, `Account delete failed for: ${KeyID(input)}`);
    }
};

/**
 * User account creation handler.
 *
 * @param {Context} context - Source configuration.
 * @param {StdAccountCreateInput} input - User account creation attribute add plan.
 * @param {Response<StdAccountCreateOutput>} res - stream to write operation response.
 * @throws {ConnectorError} error - A generic error thrown when operation fails.
 */
export const stdAccountCreateHandler: StdAccountCreateHandler = async (
    context: Context,
    input: StdAccountCreateInput,
    res: Response<StdAccountCreateOutput>
): Promise<void> => {
    logger.info(input, 'Account creation plan.');
    const ciscoConnector = await getCiscoUmbrellaConnector();
    try {
        await ciscoConnector.createAccount(input, res);
    } catch (error) {
        logAndRethrowError(error as Error, 'Account create failed.');
    }
};

/**
 * Log an error and throws it the upper chain.
 *
 * @param {Error} error - instance of an error
 * @param {string} message - a message to add to an error
 */
const logAndRethrowError = (error: Error, message: string) => {
    if (error instanceof ConnectorError) {
        logger.error(error, message);

        throw error;
    } else {
        const ce = new ConnectorError(`${message} ${error.message}`, error);
        logger.error(ce);

        throw ce;
    }
};
