import { useCallbackRef } from "use-callback-ref";
export function useNodeChildHolder() {
    /*useEffect(()=>{
        return ()=>{
        };
    });*/
    let ref = useCallbackRef(null, comp => {
        if (comp) {
        }
        else {
        }
    });
    return { ref };
}
