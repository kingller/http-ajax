"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getStorageByType(type) {
    var _storage = localStorage;
    if (type === 'session') {
        _storage = sessionStorage;
    }
    return _storage;
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
