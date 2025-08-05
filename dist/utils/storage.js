"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var _localStorage = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
var _sessionStorage = {};
var createStoragePolyfill = function (type) {
    var _storage = _localStorage;
    if (type === 'session') {
        _storage = _sessionStorage;
    }
    return {
        getItem: function (key) {
            return _storage[key];
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setItem: function (key, val) {
            _storage[key] = val;
        },
        removeItem: function (key) {
            delete _storage[key];
        },
        clear: function () {
            Object.keys(_storage).forEach(function (key) {
                delete _storage[key];
            });
        },
    };
};
function getStorageByType(type) {
    if (typeof window !== 'undefined') {
        var _storage = localStorage;
        if (type === 'session') {
            _storage = sessionStorage;
        }
        if (_storage) {
            return _storage;
        }
    }
    return createStoragePolyfill(type);
}
var storage = {
    getItem: function (key, type) {
        try {
            var _storage = getStorageByType(type);
            var value = _storage.getItem(key);
            if (value)
                value = JSON.parse(value);
            return value;
        }
        catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console &&
                console.error("Failed to get ".concat(key, " from ").concat(type === 'session' ? 'sessionStorage' : 'localStorage'));
            return undefined;
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setItem: function (key, val, type) {
        try {
            var _storage = getStorageByType(type);
            if (typeof val === 'undefined') {
                _storage.removeItem(key);
            }
            else {
                _storage.setItem(key, JSON.stringify(val));
            }
        }
        catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console &&
                console.error("Failed to set ".concat(key, " into ").concat(type === 'session' ? 'sessionStorage' : 'localStorage'));
        }
    },
    removeItem: function (key, type) {
        try {
            var _storage = getStorageByType(type);
            if (typeof _storage.getItem(key) !== 'undefined') {
                _storage.removeItem(key);
            }
        }
        catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console &&
                console.error("Failed to remove ".concat(key, " into ").concat(type === 'session' ? 'sessionStorage' : 'localStorage'));
        }
    },
    clear: function (type) {
        try {
            var _storage = getStorageByType(type);
            _storage.clear();
        }
        catch (e) {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            console && console.error("Failed to clear ".concat(type === 'session' ? 'sessionStorage' : 'localStorage'));
        }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-empty-function
    sync: function (key) { },
};
exports.default = storage;
