export function addPrefixToUrl(url: string, globalPrefix: string, optionsPrefix: string | undefined): string {
    if (typeof optionsPrefix === 'string') {
        return `${optionsPrefix}${url}`;
    }
    if (/^https?:\/\//.test(url)) {
        return url;
    }
    return `${globalPrefix}${url}`;
}
