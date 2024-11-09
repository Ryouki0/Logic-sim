
export const MINIMAL_BLOCKSIZE = 26;
export const DEFAULT_INPUT_DIM = {width: 21, height: 21};
export const CANVASTOP_HEIGHT = 2*MINIMAL_BLOCKSIZE;

export const DEFAULT_GATE_DIM = {width: 100, height: 100};
export const LINE_WIDTH = 8;
export const CANVAS_OFFSET_LEFT = 2*MINIMAL_BLOCKSIZE;

export const getClosestBlock = (x:number, y:number, blockSize: number) => {
	const distanceX = (x - 0) % blockSize;
	const distanceY = (y - 0) % blockSize;

	//console.log(`distanceX: ${distanceX} distanceY: ${distanceY}`);

	if(distanceX >= (blockSize / 2)){
		x += blockSize - distanceX;
	}
	else if(distanceX < (blockSize/2)){
		x -= distanceX;
	}
	if(distanceY >= (blockSize/2)){
		y += blockSize - distanceY;
	}
	else if(distanceY < (blockSize/2)){
		y -= distanceY;
	}
	return {roundedX: x, roundedY: y};
};


export const CANVAS_WIDTH = getClosestBlock(0.8*window.innerWidth,0, MINIMAL_BLOCKSIZE).roundedX;
export const CANVAS_HEIGHT = window.innerHeight - 2*MINIMAL_BLOCKSIZE;
export const DEFAULT_BORDER_WIDTH = 5;