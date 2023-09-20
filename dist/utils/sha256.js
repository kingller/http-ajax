"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_crypto_1 = __importDefault(require("client-crypto"));
function SHA256(message) {
    return client_crypto_1.default.SHA256(message);
}
exports.default = SHA256;
