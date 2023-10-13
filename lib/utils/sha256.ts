import Crypto from 'client-crypto';

export default function SHA256(message: string | ArrayBuffer) {
    return Crypto.SHA256(message);
}
