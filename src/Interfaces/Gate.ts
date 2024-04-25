import { BinaryInput } from "./BinaryInput";

export interface Gate{
    inputs: BinaryInput[];
    outputs: BinaryInput[];
}