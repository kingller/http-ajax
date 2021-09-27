"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ajax_1 = __importDefault(require("./ajax"));
exports.Ajax = __importStar(require("./interface"));
var base_1 = require("./base");
Object.defineProperty(exports, "AjaxBase", { enumerable: true, get: function () { return base_1.default; } });
var form_1 = require("./utils/form");
Object.defineProperty(exports, "isFormData", { enumerable: true, get: function () { return form_1.isFormData; } });
var promise_1 = require("./utils/promise");
Object.defineProperty(exports, "promisify", { enumerable: true, get: function () { return promise_1.promisify; } });
var response_data_1 = require("./utils/response-data");
Object.defineProperty(exports, "getResponseData", { enumerable: true, get: function () { return response_data_1.getResponseData; } });
exports.default = ajax_1.default;
