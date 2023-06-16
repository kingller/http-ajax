import { ILoading } from './interface';
declare function loadingExtend(argsOptions?: {
    getLoading: (props: {
        loadingName: string | symbol;
    }) => ILoading;
}): () => void;
export default loadingExtend;
