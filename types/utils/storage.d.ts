declare const storage: {
    getItem: (key: string, type?: 'local' | 'session') => string | number | boolean | object;
    setItem: (key: string, val: any, type?: 'local' | 'session') => void;
    removeItem: (key: string, type?: 'local' | 'session') => void;
    clear: (type?: 'local' | 'session') => void;
    sync: (key: string) => any;
};
export default storage;
