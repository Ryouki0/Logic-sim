import { DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from "../../Constants/defaultDimensions";
import { BinaryIO } from "../../Interfaces/BinaryIO";

export default function changeGlobalInputPosition(input:BinaryIO){
    if(isNaN(input.style?.top as any)){
        throw new Error(`Input style cannot be interpreted as a number: ${input.style?.top}`);
    }
    const newInput:BinaryIO = {
        ...input,
        position: {
            x: 2*MINIMAL_BLOCKSIZE,
            y: (input.style?.top as number) + DEFAULT_INPUT_DIM.height/2 + 2*MINIMAL_BLOCKSIZE,
        }
    };

    return newInput;
}