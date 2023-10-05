/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */
import {
    Response,
    StdAccountListOutput,
    StdAccountReadInput,
    StdAccountListInput,
    StdAccountReadOutput,
    StdEntitlementListOutput,
    StdTestConnectionOutput,
    KeyID,
    SimpleKey,
    StdAccountDeleteInput,
    StdAccountDeleteOutput,
    StdEntitlementReadOutput,
    StdAccountCreateInput,
    StdAccountCreateOutput
} from '@sailpoint/connector-sdk';

import { logger } from '../tools';
import { convertToConnectorError, InvalidRequestError, InvalidResponseError } from '../error';
import { CiscoUmbrellaClient } from '.';

/**
 * Cisco Umbrella connector
 */
export class CiscoUmbrellaConnector {
    private client: CiscoUmbrellaClient;
    private groupAttribute = 'roles';

    constructor(config: any) {
        this.client = new CiscoUmbrellaClient(config);
    }

    /**
     * Connection check with Cisco Umbrella Application
     * @param {Response<StdAccountReadOutput>} res - stream to write a response
     * @throws {ConnectorError} error - A generic error thrown when operation fails.
     */
    async testConnection(res: Response<StdTestConnectionOutput>): Promise<void> {
        logger.debug('Performing Test Connection.');
        try {
            await this.client.testConnection();
            logger.debug('Test connection is successful');
        } catch (error) {
            convertToConnectorError(error);
        }
        res.send({} as StdTestConnectionOutput);
    }

    /**
     * Read user account.
     *
     * @param {StdAccountReadInput} input - native identifier information
     * @param {Response<StdAccountReadOutput>} res - stream to write a response
     * @throws {ConnectorError} error - A generic error thrown when operation fails
     */
    async readAccount(input: StdAccountReadInput, res: Response<StdAccountReadOutput>): Promise<void> {
        const nativeIdentity = KeyID(input);
        logger.debug('Performing read account for: ' + nativeIdentity);
        if (!nativeIdentity) {
            throw new InvalidRequestError('Native identifier cannot be empty.');
        }

        res.send((await this.readUser(nativeIdentity)) as StdAccountReadOutput);
        logger.debug('Read account successful for: ' + nativeIdentity);
    }

    private async readUser(identity: string): Promise<StdAccountReadOutput> {
        let response;
        try {
            response = await this.client.readAccount(identity);
        } catch (error) {
            convertToConnectorError(error);
        }

        if (!response || !response.data) {
            throw new InvalidResponseError('Empty response for user resource retrieve.');
        }

        return this.constructUserRO(response.data);
    }

    /**
     * Aggregate Cisco Umbrella service provider's accounts.
     * @param {Response<StdAccountListOutput>} res - stream to write a response
     * @throws {ConnectorError} error - A generic error thrown when operation fails.
     */
    async listAccounts(input: StdAccountListInput, res: Response<StdAccountListOutput>): Promise<void> {
        let result;
        let page = 1; // resource record offset start with 1
        let hasNextPage = true;

        // query and paginate through user resources
        const resPromises: Promise<void>[] = [];
        while (hasNextPage) {
            try {
                result = await this.client.listUsers(page);
            } catch (error) {
                convertToConnectorError(error);
            }
            //No StartIndex, TotalResult receiving from listUsers api response
            //At last page we are getting empty result
            if (!result || !result.data || result.data.length == 0) {
                hasNextPage = false;
                break;
            }

            resPromises.push(
                ...result.data.map(async (resource: any) => {
                    const ro = this.constructUserRO(resource) as StdAccountListOutput;
                    logger.debug('User RO: ' + JSON.stringify(ro));
                    res.send(ro);
                })
            );

            // Increment page
            page = page + 1;
        }

        await Promise.all(resPromises);
        logger.debug('Cisco Umbrella account aggregation successful');
    }

    /**
     * Aggregate security roles.
     * @param {Response<StdAccountListOutput>} res - stream to write a response
     * @throws {ConnectorError} error - A generic error thrown when operation fails.
     */
    async listEntitlements(res: Response<StdEntitlementListOutput>): Promise<void> {
        logger.debug('Cisco Umbrella Entitlements aggregation initiated');
        let result;
        try {
            result = await this.client.listEntitlements();
        } catch (error) {
            convertToConnectorError(error);
        }

        if (!result?.data) {
            throw new InvalidResponseError('Found empty response for account list.');
        }

        result.data.map(async (role: any) => {
            res.send(this.constructRolesRO(role) as StdEntitlementListOutput);
        });
        logger.debug('Cisco Umbrella Entitlements aggregation successful');
    }

    /**
     * Remove user.
     *
     * Note - Service providers MAY choose not to permanently delete the resource.
     *
     * @param {StdAccountDeleteInput} input - user identifier to delete.
     * @param {Response<StdAccountDeleteOutput>} res - stream to write a response.
     */
    async deleteAccount(input: StdAccountDeleteInput, res: Response<StdAccountDeleteOutput>): Promise<void> {
        const userId = KeyID(input);
        if (!userId) {
            throw new InvalidRequestError('Native identifier cannot be empty.');
        }
        try {
            await this.client.deleteUser(userId);
        } catch (error) {
            convertToConnectorError(error);
        }

        // Add empty response to convey success
        res.send({} as StdAccountDeleteOutput);
        logger.debug('Cisco Umbrella Delete account successful');
    }

    /**
     * Create a new user
     *
     * @param {StdAccountCreateInput} input - New user definition.
     * @param {Response<StdAccountCreateOutput>} res - stream to write a response.
     */
    async createAccount(input: StdAccountCreateInput, res: Response<StdAccountCreateOutput>): Promise<void> {
        logger.debug('Performing create account.');
        let result;
        const attributeReq = input.attributes;
        const firstName = attributeReq?.['firstname'];
        const lastName = attributeReq?.['lastname'];
        const email = attributeReq?.['email'];
        const password = attributeReq?.['password'];
        const timezone = attributeReq?.['timezone'];
        const inputRoles = attributeReq?.roleId;

        if (!firstName) {
            throw new InvalidRequestError('Required attribute firstname is either null or empty');
        }

        if (!lastName) {
            throw new InvalidRequestError('Required attribute lastname is either null or empty');
        }
        if (!inputRoles) {
            throw new InvalidRequestError('Required attribute role is either null or empty');
        }

        if (!email) {
            throw new InvalidRequestError('Required attribute email is either null or empty');
        }

        if (!timezone) {
            throw new InvalidRequestError('Required attribute timezone is either null or empty');
        }

        if (!password) {
            throw new InvalidRequestError('Required attribute password is either null or empty');
        }
        try {
            result = await this.client.addUser(attributeReq);
        } catch (error) {
            convertToConnectorError(error);
        }

        if (!result?.data?.id) {
            throw new InvalidResponseError('Found empty response for user creation.' + result);
        }
        res.send((await this.constructUserRO(result.data)) as StdAccountCreateOutput);
        logger.debug('Create account successful, the native identitifier: ' + result.data.id);
    }

    private constructUserRO(result: any): StdAccountReadOutput {
        return {
            key: SimpleKey(String(result.id!)),
            disabled: result.status == 'Active' ? false : true,
            attributes: {
                id: String(result.id),
                firstname: result.firstname,
                lastname: result.lastname,
                email: result.email,
                role: result.role,
                roleId: result.roleId,
                status: result.status,
                twoFactorEnable: result.twoFactorEnable,
                timezone: result.timezone,
                lastLoginTime: result.lastLoginTime
            }
        } as StdAccountReadOutput;
    }

    private constructRolesRO(result: any): StdEntitlementReadOutput {
        const ro = {
            key: SimpleKey(String(result.roleId!)),
            type: 'group',
            attributes: {
                roleId: String(result.roleId),
                label: result.label,
                organizationId: result.organizationId
            }
        } as StdEntitlementReadOutput;

        return ro;
    }
}
