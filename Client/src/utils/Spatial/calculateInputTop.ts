/**
 * It calculates the relative position for the "customGate" component. To get the absolute
 * position of the input add half the input's height, and the current index times the input's height to the gate's Y.
 * This calculates the outputs too, but they are absolutely positioned, instead of relatively.
 * @param idx The current inputs index
 * @param arrayLength The inputs length
 * @returns The relative position for the customGate
 */
export const calculateInputTop = (idx: number, arrayLength: number, blockSize: number, ioRadius: number) : number => {
	if(arrayLength == 1){
		return blockSize -ioRadius/2;
	}
	const defaultExpression = -((ioRadius/2)) + (idx*(blockSize - ioRadius));
	if(arrayLength % 2 === 0){
		if(idx >= (arrayLength / 2)){
			return -((ioRadius/2)) + ((idx+1)*(blockSize - ioRadius)) + ioRadius;
		}
	}
	return defaultExpression; 
};