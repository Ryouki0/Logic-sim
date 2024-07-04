
export const getClosestBlock = (x:number, y:number) => {
	const distanceX = x % MINIMAL_BLOCKSIZE;
	const distanceY = y % MINIMAL_BLOCKSIZE;

	//console.log(`distanceX: ${distanceX} distanceY: ${distanceY}`);

	if(distanceX >= (MINIMAL_BLOCKSIZE / 2)){
		x += MINIMAL_BLOCKSIZE - distanceX;
	}
	else if(distanceX < (MINIMAL_BLOCKSIZE/2)){
		x -= distanceX;
	}
	if(distanceY >= (MINIMAL_BLOCKSIZE/2)){
		y += MINIMAL_BLOCKSIZE - distanceY;
	}
	else if(distanceY < (MINIMAL_BLOCKSIZE/2)){
		y -= distanceY;
	}
	return {roundedX: x, roundedY: y};
};

export const MINIMAL_BLOCKSIZE = 30;
export const DEFAULT_INPUT_DIM = {width: 23, height: 23};

export const DEFAULT_GATE_DIM = {width: 100, height: 100};
export const LINE_WIDTH = 8;
export const CANVAS_OFFSET_LEFT = 0*MINIMAL_BLOCKSIZE;
export const CANVAS_WIDTH = getClosestBlock(0.8*window.innerWidth,0).roundedX;
export const CANVAS_HEIGHT = 0.9 * window.innerHeight;
export const DEFAULT_BORDER_WIDTH = 5;