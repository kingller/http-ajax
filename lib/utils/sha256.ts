import Crypto from 'client-crypto';

export default function SHA256(message: string) {
    return Crypto.SHA256(message);
}
