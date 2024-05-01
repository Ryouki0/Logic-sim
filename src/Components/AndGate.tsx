import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './Input';
import { DEFAULT_INPUT_DIM, DEFAULT_INPUT_OFFSET_TOP, LINE_WIDTH, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';
import { Output } from './Output';

function AndGate(){
    const eleRef = React.useRef<HTMLDivElement>(null);
    const dispatch = useDispatch();
    const [{dx, dy}, setOffset] = useState({dx: 0, dy: 0});
    const [{x,y}, setPosition] = useState({x: 0, y:0});
    const name = "AND";
    const inputs: BinaryInput[] = [{state: 0, id:crypto.randomUUID()},{state: 0, id: crypto.randomUUID()}];

    const calculateDivHeight = () => {
        return inputs.length % 2 === 0 ? (inputs.length * MINIMAL_BLOCKSIZE) + LINE_WIDTH : ((inputs.length-1) * MINIMAL_BLOCKSIZE) +LINE_WIDTH
    }

    const calculateInputTop = (idx: number, array: BinaryInput[]) => {
        const defaultExpression = -((DEFAULT_INPUT_DIM.height/2)) + (idx*(MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height));
        if(array.length % 2 === 0){
            if(idx >= (array.length / 2)){
                return -((DEFAULT_INPUT_DIM.height/2)) + ((idx+1)*(MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height)) + DEFAULT_INPUT_DIM.height;
            }
        }
        return defaultExpression; 
    }

    return (
        <>
            <div ref={eleRef} 
            className='Gate-container' 
            style={{width: 3*MINIMAL_BLOCKSIZE, 
                height: calculateDivHeight(),
                position: 'relative',
                top: y,
                left: x,
                marginLeft:4,
                backgroundColor: "rgb(100 100 100)"}} 
            id={crypto.randomUUID()}
            onMouseDown={e => handleMouseDown(e, eleRef, dispatch, dx, dy, setOffset, setPosition)}
            >
                {inputs.map((input, idx, array) => {
                    return (
                    <Input style={{
                        alignSelf: 'center',
                        top: calculateInputTop(idx, array),
                    }}
                    id = {input.id}
                    key = {input.id}
                    state = {input.state}></Input>)
                })}
                <div style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}> 
                <span 
                className='Gate-container' 
                style={{color: 'red', cursor: "pointer", userSelect: 'none'}} 
                onMouseDown={e => {
                    //e.preventDefault();
                    //e.stopPropagation(); 
                    handleMouseDown(e, eleRef, dispatch, dx, dy, setOffset, setPosition)
                }}
                >{name}</span>
                </div>
                <Output style={{position: 'absolute', left:
                (3*MINIMAL_BLOCKSIZE)-DEFAULT_INPUT_DIM.width/2,
                top:MINIMAL_BLOCKSIZE - DEFAULT_INPUT_DIM.height/2 }} state={0} id="1232"></Output>
            </div>
        </>
    )
}
export {AndGate};