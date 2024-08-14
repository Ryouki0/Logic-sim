import React from 'react';
import '../../menu.css';

export default function MenuButton({buttonText, fn}: {buttonText:string, fn?: () => void}){
    return <button className='button' onClick={fn}>
        {buttonText}
    </button>
}