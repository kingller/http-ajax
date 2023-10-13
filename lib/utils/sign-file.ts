import SHA256 from './sha256';

function readFile(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function () {
            resolve(reader.result as ArrayBuffer); // This is the file content as ArrayBuffer
        };

        reader.onerror = function (this: FileReader, ev: ProgressEvent<FileReader>) {
            reject(ev);
            return null;
        };

        reader.readAsArrayBuffer(file); // Read file as ArrayBuffer
    });
}

export default async function signFile(file: File) {
    // 只对前 10M 文件内容进行签名
    const chunkSize = 10 * 1024 * 1024;

    const data = await readFile(file.slice(0, chunkSize) as File);

    return SHA256(data);
}
