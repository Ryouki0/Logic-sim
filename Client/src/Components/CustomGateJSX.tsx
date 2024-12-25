import { Gate } from '@Shared/interfaces';
import React from 'react';
import { MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';

export const CustomGateJSX = React.memo(function CustomGateJSX({thisGate, eleRef, spanDivRef, spanRef, heightMultiplier, isBluePrint} : 
    {
        thisGate:Gate,
        eleRef?: React.RefObject<HTMLDivElement>,
        spanDivRef?: React.RefObject<HTMLDivElement>,
        spanRef?: React.RefObject<HTMLSpanElement>,
        heightMultiplier?: number,
		isBluePrint?: boolean,
    }){
	if(!thisGate){
		return null;
	}
	return (
	// console.log('gate rendering'),
		<>
    
			<div ref={eleRef ?? null}
				className={isBluePrint ? 'Gate-container bluePrint' : 'Gate-container displayAllGates' }
				style={{
					height: `calc(var(--block-size) * ${heightMultiplier})`,
					width: `calc(var(--block-size) * 3)`,
					position: 'absolute',
					transform: thisGate?.position 
						? `translate(${thisGate.position.x}px, ${thisGate.position.y}px)` 
						: 'translate(0, 0)',
					borderTopRightRadius: 30,
					borderBottomRightRadius: 30,
					display: 'inline-block',
					justifySelf: 'center',
					borderStyle: 'solid',
					borderWidth: 1,
					borderColor: 'black',
					cursor: 'pointer',
					pointerEvents: 'auto',
					backgroundColor: "rgb(117 117 117)"} as React.CSSProperties} 
				id={thisGate.id}
			>
				<div
					ref={spanDivRef ?? null}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						height: "100%", // Match parent container
						pointerEvents: "none",
					}}
				>
					<span 
						ref={spanRef ?? null}
						style={{
							fontSize: `calc(var(--block-size) * ${18 / MINIMAL_BLOCKSIZE})`,
							userSelect: "none",
							pointerEvents: "none",
							color: "white",
							lineHeight: 1, // Prevent extra spacing
						}}
					>
						{thisGate?.name}
					</span>
				</div>
			</div>
                
		</>
	);
});