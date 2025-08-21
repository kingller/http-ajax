"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOpenApi = exports.getResponseData = exports.promisify = exports.isFormData = exports.AjaxBase = exports.Ajax = void 0;
var ajax_1 = __importDefault(require("./ajax"));
exports.Ajax = __importStar(require("./interface"));
var base_1 = require("./base");
Object.defineProperty(exports, "AjaxBase", { enumerable: true, get: function () { return __importDefault(base_1).default; } });
var form_1 = require("./utils/form");
Object.defineProperty(exports, "isFormData", { enumerable: true, get: function () { return form_1.isFormData; } });
var promise_1 = require("./utils/promise");
Object.defineProperty(exports, "promisify", { enumerable: true, get: function () { return promise_1.promisify; } });
var response_data_1 = require("./utils/response-data");
Object.defineProperty(exports, "getResponseData", { enumerable: true, get: function () { return response_data_1.getResponseData; } });
var response_data_2 = require("./utils/response-data");
Object.defineProperty(exports, "isOpenApi", { enumerable: true, get: function () { return response_data_2.isOpenApi; } });
exports.default = ajax_1.default;
