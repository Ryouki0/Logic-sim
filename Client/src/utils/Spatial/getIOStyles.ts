
export const getIOLeftStyle = (type: 'input' | 'output' | undefined, blockSize: number, ioRadius: number) => {
	if(type === 'input'){
		return 2*blockSize - (ioRadius / 2);
	}else if(type === 'output'){
		return -ioRadius/2;
	}else{
		return;
	}
};


export const getLeftStyle = (
	type: 'input' | 'output' | undefined, 
	blockSize:number, 
	position: {x: number, y: number}
) => {
	if(type === 'input'){
		return position.x - 2*blockSize;
	}else if(type === 'output'){
		return position.x;
	}else{
		return;
	}
};