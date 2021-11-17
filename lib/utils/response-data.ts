// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getResponseData<T = any>({ response, statusField }: { response: any; statusField: string }) {
    if (response && typeof response === 'object') {
        if (typeof response.apiVersion !== 'undefined') {
            return response.details;
        }
        if (typeof response[statusField] !== 'undefined') {
            return response.data;
        }
    }
    return response as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setResponseData({ response, data, statusField }: { response: any; data: any; statusField: string }) {
    if (response && typeof response === 'object') {
        if (typeof response.apiVersion !== 'undefined') {
            return { ...response, details: data };
        }
        if (typeof response[statusField] !== 'undefined') {
            return { ...response, data };
        }
    }
    return data;
}
