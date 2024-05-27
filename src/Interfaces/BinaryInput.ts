import { BinaryOutput } from "./BinaryOutput";
import { Wire } from "./Wire";

export interface BinaryInput{
    state: 0 | 1,
    style?: React.CSSProperties | null,
    wires?: Wire[] | null,
    id: string,
    gateId?: string,
    position?: {x:number,y:number},
    from?: {id: string, type: 'inputs' | 'outputs', gateId?: string | null } | null,
    to?: [{id: string, type: 'inputs' | 'outputs', gateId?: string | null}] | null,
}