// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _isOpenApi(response: { [name: string]: any }) {
    return response.code !== undefined && response.details !== undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isOpenApi(response: any) {
    if (response && typeof response === 'object') {
        return _isOpenApi(response);
    }
    return false;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getResponseData<T = any>({ response, statusField }: { response: any; statusField: string }) {
    if (response && typeof response === 'object') {
        if (_isOpenApi(response)) {
            return response.details;
        }
        if (response[statusField] !== undefined) {
            return response.data;
        }
    }
    return response as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setResponseData({ response, data, statusField }: { response: any; data: any; statusField: string }) {
    if (response && typeof response === 'object') {
        if (_isOpenApi(response)) {
            return { ...response, details: data };
        }
        if (response[statusField] !== undefined) {
            return { ...response, data };
        }
    }
    return data;
}
