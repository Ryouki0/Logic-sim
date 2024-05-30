import { ChildProcessWithoutNullStreams } from "child_process";
import { BinaryInput } from "./BinaryInput";
import { Wire } from "./Wire";

export interface BinaryOutput{
    state: 0 | 1,
    style?: React.CSSProperties | null,
    wires?: Wire[] | null,
    gateId?: string,
    id: string,
    position?: {x:number,y:number},
    to?: {id: string, type: 'inputs' | 'outputs', gateId?: string | null}[] | null,
    from?:{id: string, type: 'inputs' | 'outputs', gateId?: string | null} | null,
}