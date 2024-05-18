import { Wire } from "./Wire";

export interface BinaryInput{
    state: 0 | 1,
    style?: React.CSSProperties | null,
    wires?: Wire[] | null,
    id: string,
    position?: {x:number,y:number}
}