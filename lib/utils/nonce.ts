export default function getNonce(appNonce: string) {
    const end = appNonce.length - 1;
    return appNonce.substring(2, end);
}
