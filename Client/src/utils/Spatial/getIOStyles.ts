import { DEFAULT_INPUT_DIM } from "../../Constants/defaultDimensions";

export const getIOLeftStyle = (type: 'input' | 'output' | undefined, blockSize: number) => {
    if(type === 'input'){
        return 2*blockSize - (DEFAULT_INPUT_DIM.width / 2);
    }else if(type === 'output'){
        return -DEFAULT_INPUT_DIM.width/2;
    }else{
        return;
    }
}


export const getLeftStyle = (
    type: 'input' | 'output' | undefined, 
    blockSize:number, 
    cameraOffset: {x: number, y: number}, 
    position: {x: number, y: number}
) => {
    if(type === 'input'){
        return position.x - 2*blockSize + cameraOffset.x;
    }else if(type === 'output'){
        return position.x + cameraOffset.x;
    }else{
        return;
    }
}