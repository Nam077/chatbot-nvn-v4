import { AxiosError as BaseAxiosError } from 'axios';
import { JsonValue } from 'type-fest';

function indent(str: string): string {
    return str
        .split('\n')
        .map((s) => (s ? `  ${s}` : ''))
        .join('\n');
}

function formatJson(data: unknown): string {
    const jsonData = isJsonValue(data) ? data : null;
    return JSON.stringify(jsonData, null, 2);
}

function isJsonValue(value: unknown): value is JsonValue {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean' ||
        value === null ||
        Array.isArray(value) ||
        typeof value === 'object'
    );
}

class AxiosError extends Error {
    config: BaseAxiosError['config'];
    request?: BaseAxiosError['request'];
    response?: BaseAxiosError['response'];
    status?: number;

    constructor(
        messageOrError: string | BaseAxiosError,
        error?: BaseAxiosError | Pick<BaseAxiosError, 'config' | 'request' | 'response'>,
    ) {
        let err: Pick<BaseAxiosError, 'config' | 'request' | 'response'>;
        if (typeof messageOrError === 'string') {
            super(messageOrError);
            err = error as Pick<BaseAxiosError, 'config' | 'request' | 'response'>;
        } else {
            super(messageOrError.message);
            err = messageOrError;
        }

        const { config, request, response } = err;
        this.config = config;
        this.request = request;
        this.response = response;
        if (response && response.status) {
            this.status = response.status;
        }

        this.name = 'AxiosError';
    }

    toString(): string {
        const { message, name, status, config, request, response } = this;
        const str = `${name}: ${message}`;
        const details = [
            `status: ${status}`,
            `config: ${formatJson(config)}`,
            `request: ${formatJson(request)}`,
            `response: ${formatJson(response)}`,
        ]
            .filter((s) => s)
            .join('\n');
        return `${str}\n${indent(details)}`;
    }
}

export = AxiosError;
