import React from "react";
import { Wire } from "../Interfaces/Wire";
import { AMBER } from "../Constants/colors";

export default function WireSelected({wire} : {wire:Wire}){
   
    return <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
        <div style={{width: 150, height: 10, backgroundColor:AMBER, alignSelf: 'center', marginTop: '30%'}}>

        </div>
        <span style={{
            color: 'white', 
            fontSize: 16,
            marginTop: 10,
            }}>ID: {wire.id.slice(0,6)}...</span>
        <span style={{
            color: 'white', 
            fontSize: 16,
            marginTop: 10,
        }}>wirePath: {wire.wirePath?.map(w => {return w.slice(0,6)}).join(' - ')}</span>
        <span style={{
            color: 'white', 
            fontSize: 16,
            marginTop: 10}}>CONNECTED TO: {wire.connectedToId?.map(to => to.id.slice(0,6)).join('')}</span>
    </div>
}