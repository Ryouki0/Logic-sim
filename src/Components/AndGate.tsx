import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import handleMouseDown from '../handleGateEvents';
import { Input } from './Input';
import { DEFAULT_INPUT_DIM, DEFAULT_INPUT_OFFSET_TOP, MINIMAL_BLOCKSIZE } from '../Constants/defaultDimensions';
import { BinaryInput } from '../Interfaces/BinaryInput';

function AndGate(){
    const eleRef = React.useRef<any>();
    const dispatch = useDispatch();
    const [{dx, dy}, setOffset] = useState({dx: 0, dy: 0});
    const name = "AND";
    const inputs: BinaryInput[] = [{state: 0, id:crypto.randomUUID()}, {state: 0, id: crypto.randomUUID()}];
    
    return (
        <>
            <div ref={eleRef} 
            className='Gate-container' 
            style={{width: 100, 
                height: (inputs.length * DEFAULT_INPUT_DIM.height) + ((inputs.length + 1) * MINIMAL_BLOCKSIZE),
                position: 'relative',
                backgroundColor: "rgb(100 100 100)"}} 
            id={crypto.randomUUID()}
            onMouseDown={e => handleMouseDown(e, eleRef, dispatch, dx, dy, setOffset)}
            >
                {inputs.map((input, idx) => {
                    return <Input style={{
                        alignSelf: 'center',
                        top: MINIMAL_BLOCKSIZE - DEFAULT_INPUT_OFFSET_TOP,
                        marginTop: MINIMAL_BLOCKSIZE,
                    }}
                    id = {input.id}
                    state = {input.state}></Input>
                })}
                <div style={{position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)"}}> 
                <span 
                className='Gate-container' 
                style={{color: 'red', cursor: "pointer", userSelect: 'none'}} 
                onMouseDown={e => {
                    e.preventDefault();
                    e.stopPropagation(); 
                    handleMouseDown(e, eleRef, dispatch, dx, dy, setOffset)
                }}
                >{name}</span>
                </div>
                
            </div>
        </>
    )
}
export {AndGate};