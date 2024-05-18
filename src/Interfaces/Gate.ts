import { BinaryInput } from "./BinaryInput";
import { BinaryOutput } from "./BinaryOutput";

export interface Gate{
    name: string,
    id: string,
    position?: {x: number, y: number},
    inputs: BinaryInput[],
    outputs: BinaryInput[],
}