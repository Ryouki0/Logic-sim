import { Wire } from "./Wire";

export interface BinaryOutput{
    state: 0 | 1,
    style?: React.CSSProperties | null,
    wires?: Wire[] | null,
    id: string 
}