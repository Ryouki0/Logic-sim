
export const getIOLeftStyle = (type: 'input' | 'output' | undefined, blockSize: number, ioRadius: number) => {
    if(type === 'input'){
        return 2*blockSize - (ioRadius / 2);
    }else if(type === 'output'){
        return -ioRadius/2;
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