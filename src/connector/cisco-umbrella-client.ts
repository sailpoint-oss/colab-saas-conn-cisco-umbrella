/* Copyright (C) 2023 SailPoint Technologies, Inc.  All rights reserved. */

import { logger } from '../tools';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';
import axiosRetry from 'axios-retry';
import { InvalidResponseError } from '../error';

export class CiscoUmbrellaClient {
    private readonly baseUrl: string = 'https://api.umbrella.com';
    private apiKey: string;
    private keySecret: string;
    private axiosInstance: AxiosInstance;
    private headers: AxiosRequestHeaders;
    private readonly authorizationHeader: string = 'Authorization';
    private readonly bearer: string = 'Bearer ';
    accessToken: string | undefined;
    private pageSize!: number;

    constructor(config: any) {
        this.apiKey = config.apiKey;
        this.keySecret = config.keySecret;
        this.pageSize = config?.pageSize || 200;
        this.headers = {
            'Content-Type': `application/json`,
            Accept: `application/json`
        };

        this.axiosInstance = axios.create({
            baseURL: this.baseUrl,
            headers: this.headers
        });

        this.axiosInstance.interceptors.request.use(async (config: AxiosRequestConfig) => {
            logger.debug(`Executing endpoint: ${config?.method?.toUpperCase()} : ${config?.url}`);
            if (!config.headers) {
                config.headers = this.headers;
            }
            config.headers[this.authorizationHeader] = this.bearer + this.accessToken;
            return config;
        });

        axiosRetry(this.axiosInstance, {
            retries: 3,
            retryDelay: () => 30000,
            retryCondition: error => {
                return error?.response?.status === 429
                    ? true
                    : error?.response?.status === 403
                    ? this.generateAPIToken(true)
                    : false;
            }
        });
    }

    async generateAPIToken(force: boolean): Promise<boolean> {
        let accessToken;
        if (!this.accessToken || force) {
            accessToken = await this.getToken();

            if (!accessToken) {
                throw new InvalidResponseError('Found empty response for token generation.');
            }

            this.accessToken = accessToken;
        }
        return true;
    }

    private async getToken(): Promise<string> {
        const result: any = await this.axiosInstance.post(
            this.baseUrl + '/auth/v2/token',
            {},
            {
                auth: {
                    username: this.apiKey,
                    password: this.keySecret
                }
            }
        );

        return result?.data.access_token;
    }

    /**
     * Test connection
     */
    async testConnection(): Promise<void> {
        await this.generateAPIToken(false);
    }

    /**
     * Read Account
     */
    async readAccount(identity: any): Promise<AxiosResponse> {
        await this.generateAPIToken(false);
        return this.axiosInstance.get(`${this.baseUrl}/admin/v2/users/${identity}`);
    }

    /**
     * List Account
     */
    async listUsers(page: number, limit = this.pageSize): Promise<AxiosResponse> {
        await this.generateAPIToken(false);
        return this.axiosInstance.get(`${this.baseUrl}/admin/v2/users?page=${page}&limit=${limit}`);
    }

    /**
     * List Entitlement
     */
    async listEntitlements(): Promise<AxiosResponse> {
        await this.generateAPIToken(false);
        return this.axiosInstance.get(`${this.baseUrl}/admin/v2/roles`);
    }

    /**
     * Delete user Account.
     *
     * @returns {AxiosResponse} - New user summary object
     */
    async deleteUser(nativeIdentity: any): Promise<AxiosResponse> {
        await this.generateAPIToken(false);
        return this.axiosInstance.delete(`${this.baseUrl}/admin/v2/users/${nativeIdentity}`);
    }

    /**
     * Adds new user to Cisco Umbrella Account.
     *
     * @param {any} payload - A list of attribute changes
     * @returns {AxiosResponse} - New user summary object
     */
    async addUser(payload: any): Promise<AxiosResponse> {
        await this.generateAPIToken(false);
        logger.debug('Add user payload: ' + JSON.stringify(payload));
        return this.axiosInstance.post(`${this.baseUrl}/admin/v2/users`, payload);
    }
}
