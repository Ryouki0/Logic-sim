import { BinaryInput } from "./BinaryInput";
import { BinaryOutput } from "./BinaryOutput";

export interface Gate{
    name: string,
    id: string,
    position?: {x: number, y: number},
    gates?: {[key:string]:Gate};
    inputs: {[key: string]: BinaryInput},
    outputs: { [key: string]: BinaryOutput },
}