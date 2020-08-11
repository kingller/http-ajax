export function trim(str) {
    return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

export function parseHeaders(headers) {
    let headerMap = {};
    let key;
    let val;
    let i;

    if (!headers) {
        return headerMap;
    }

    // Convert the header string into an array
    // of individual headers
    const arr = headers.trim().split(/[\r\n]+/);

    arr.forEach(function (line) {
        i = line.indexOf(':');
        key = trim(line.substr(0, i)).toLowerCase();
        val = trim(line.substr(i + 1));

        if (key) {
            if (headerMap[key]) {
                return;
            }
            if (key === 'set-cookie') {
                headerMap[key] = (headerMap[key] ? headerMap[key] : []).concat([val]);
            } else {
                headerMap[key] = headerMap[key] ? headerMap[key] + ', ' + val : val;
            }
        }
    });

    return headerMap;
}
