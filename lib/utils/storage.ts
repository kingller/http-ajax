// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _localStorage: { [key: string]: any } = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _sessionStorage: { [key: string]: any } = {};
const createStoragePolyfill = function (type?: 'local' | 'session') {
    let _storage = _localStorage;
    if (type === 'session') {
        _storage = _sessionStorage;
    }
    return {
        getItem(key: string): string | number | boolean | object {
            return _storage[key];
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setItem(key: string, val: any): void {
            _storage[key] = val;
        },
        removeItem(key: string): void {
            delete _storage[key];
        },
        clear(): void {
            Object.keys(_storage).forEach((key) => {
                delete _storage[key];
            });
        },
    } as Storage;
};

function getStorageByType(type?: 'local' | 'session'): Storage {
    if (typeof window !== 'undefined') {
        let _storage = localStorage;
        if (type === 'session') {
            _storage = sessionStorage;
        }
        if (_storage) {
            return _storage;
        }
    }
    return createStoragePolyfill(type);
}

const storage = {
    getItem(key: string, type?: 'local' | 'session'): string | number | boolean | object {
        try {
            const _storage = getStorageByType(type);
            let value = _storage.getItem(key);
            if (value) value = JSON.parse(value);
            return value;
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console &&
                console.error(`Failed to get ${key} from ${type === 'session' ? 'sessionStorage' : 'localStorage'}`);
            return undefined;
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItem(key: string, val: any, type?: 'local' | 'session'): void {
        try {
            const _storage = getStorageByType(type);
            if (typeof val === 'undefined') {
                _storage.removeItem(key);
            } else {
                _storage.setItem(key, JSON.stringify(val));
            }
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console &&
                console.error(`Failed to set ${key} into ${type === 'session' ? 'sessionStorage' : 'localStorage'}`);
        }
    },
    removeItem(key: string, type?: 'local' | 'session'): void {
        try {
            const _storage = getStorageByType(type);
            if (typeof _storage.getItem(key) !== 'undefined') {
                _storage.removeItem(key);
            }
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console &&
                console.error(`Failed to remove ${key} into ${type === 'session' ? 'sessionStorage' : 'localStorage'}`);
        }
    },
    clear(type?: 'local' | 'session'): void {
        try {
            const _storage = getStorageByType(type);
            _storage.clear();
        } catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error(`Failed to clear ${type === 'session' ? 'sessionStorage' : 'localStorage'}`);
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
    sync: (key: string): any => {},
};

export default storage;
