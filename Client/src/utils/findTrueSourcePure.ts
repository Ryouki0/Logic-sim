import { Wire } from "@Shared/interfaces";
import { BinaryIO } from "../Interfaces/BinaryIO";

export default function findTrueSourcePure(wire: Wire, io: {[key: string] : BinaryIO}) {
    let trueSource: string | null = null;
    wire.from?.forEach(from => {
        if(!io[from.id]?.highImpedance){
            if(trueSource) {
                throw new Error(`Multiple sources! \n1: ${trueSource} \n2: ${from.id}`);
            }
            trueSource = from.id;
        }
    })

    return (trueSource as string | null);
}