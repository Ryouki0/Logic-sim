import React, { useEffect, useRef, useState } from 'react'
import useRunLogic from '../../hooks/useRunLogic';

export default function TestButton(){
    const [test, setTest] = useState({});

    const calls = useRef(0);
    const startTime = useRef(Date.now());
    useEffect(() => {
        calls.current++;
        if(Date.now() - startTime.current >= 1000){
            console.log(`called: ${calls.current}`);
            calls.current = 0;
            startTime.current = Date.now();
        }
    }, [test])
    return <button>test</button>
}