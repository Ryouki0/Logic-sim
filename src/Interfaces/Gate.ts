import { BinaryInput } from "./BinaryInput";

export interface Gate{
    name: string,
    inputs: BinaryInput[];
    outputs: BinaryInput[];
    innerLogic():void;
}