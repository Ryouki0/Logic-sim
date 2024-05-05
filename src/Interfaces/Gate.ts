import { BinaryInput } from "./BinaryInput";
import { BinaryOutput } from "./BinaryOutput";

export interface Gate{
    name: string,
    id: string,
    inputs: BinaryInput[];
    outputs: BinaryInput[];
    innerLogic?(inputs?:BinaryInput[], outputs?: BinaryOutput[]):void;
}