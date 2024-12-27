import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../state/store';
import { setCanvasDim } from '../../state/slices/misc';
import { MINIMAL_BLOCKSIZE } from '../../Constants/defaultDimensions';

export default function ResizeCanvas(){
	const dispatch = useDispatch();
	const blockSize = useSelector((state: RootState) => {return state.misc.blockSize;});

    useEffect(() => {
		const handleResize = () => {
			dispatch(setCanvasDim({width: 0.8*window.innerWidth, height: window.innerHeight - 2*MINIMAL_BLOCKSIZE}));
		};

		document.body.style.overflow = 'hidden';
		window.addEventListener('resize', handleResize);
	}, [blockSize]);
    return null;
}