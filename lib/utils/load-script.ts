export async function loadScript(src: string, global?: string): Promise<any> {
    return new Promise((resolve, reject): void => {
        let script = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
        if (!script) {
            script = document.createElement('script');
            script.src = src;
            script.onload = (): void => {
                if (global) {
                    resolve(window[global as keyof Window]);
                } else {
                    resolve('');
                }
            };
            script.onerror = reject;
            document.body.appendChild(script);
        }
    });
}
