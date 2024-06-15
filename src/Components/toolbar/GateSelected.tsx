
import React from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../state/store';
// import {text} from '../../Constants/commonStyles';
// import { Gate } from '../../Interfaces/Gate';
// export default function GateSelected({gate}: {gate:Gate}){
    
//     return <div style={{justifyContent: 'center', display: 'flex', flexDirection: 'column'}}>
//         <span style={text}>{gate.name}</span>
//         <span style={text}>{gate.gates ? Object.entries(gate.gates)?.map(([key, gate]) => {
//                 return `${gate.name} ID: ${gate.id.slice(0,5)}`
//         }).join(' ') : null}</span>
//         <span style={text}>{gate.gates ? Object.entries(gate.gates).map(([key, gate]) => {
//             return Object.entries(gate.inputs).map(([key, input]) => {
//                 return `${gate.name}'s input is from: ${input.from?.id.slice(0,5)}`;
//             })
//         }) : null}</span>
//         <span style={text}>{Object.entries(gate.outputs).map(([key, output]) => {
//             return `output from ID: ${output.from?.id.slice(0,5)}`
//         }).join(' ')}</span>
//         <span style={text}>{gate.gates ? Object.entries(gate.inputs).map(([key, input]) => {
//             return `input to:  ${input.to?.map(to => to.id.slice(0,5))}`;
//         }).join(' ') : null}</span>
//     </div>
// }