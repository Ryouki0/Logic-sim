import React from 'react';
import Clock from './Clock';
import CreateButton from './CreateButton';
import SelectedComponent from './SelectedComponent';

export default function Toolbar() {
    return <>
         <SelectedComponent></SelectedComponent>
         <Clock></Clock>
         <CreateButton></CreateButton>
     </>
}