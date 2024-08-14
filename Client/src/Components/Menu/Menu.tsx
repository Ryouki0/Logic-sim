import React from 'react';
import MenuButton from './MenuButton';
import '../../menu.css';
import { useNavigate } from 'react-router-dom';
export default function Menu(){
    const navigate = useNavigate();

    const newProject = () => {
        navigate('/Simulation');
    }

    return <div className='menu-container' style={{
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        justifyItems: 'center',
        alignContent: 'center',
        height: '100vh'
    }}>
        <MenuButton buttonText='New Project' fn={newProject}></MenuButton>
        <MenuButton buttonText='Sandbox'></MenuButton>
    </div>
}