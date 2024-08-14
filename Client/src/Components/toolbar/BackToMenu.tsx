import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackToMenu(){
    const navigation = useNavigate();
    const toMenu = () => {
        navigation('/');
    }
    return <div className="button-other" onClick={toMenu} style={{
        position: 'absolute',
        bottom: 0,
        width: '80%',
        left: '50%',
        transform: 'translateX(-50%)'
    }}>
        <span style={{
            color: 'white',
            fontSize: 20,
        }}>
            Menu
        </span>
    </div>
}