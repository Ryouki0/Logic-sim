import { DEFAULT_INPUT_DIM, MINIMAL_BLOCKSIZE } from "../Constants/defaultDimensions";
import { BinaryInput } from "../Interfaces/BinaryInput";

export const calculateInputTop = (idx: number, array: BinaryInput[]) => {
    if(array.length == 1){
        return MINIMAL_BLOCKSIZE -DEFAULT_INPUT_DIM.height/2;
    }
    const defaultExpression = -((DEFAULT_INPUT_DIM.height/2)) + (idx*(MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height));
    if(array.length % 2 === 0){
        if(idx >= (array.length / 2)){
            return -((DEFAULT_INPUT_DIM.height/2)) + ((idx+1)*(MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height)) + DEFAULT_INPUT_DIM.height;
        }
    }
    return defaultExpression; 
};