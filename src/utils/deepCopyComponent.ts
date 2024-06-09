import { BinaryInput } from "../Interfaces/BinaryInput";
import { BinaryOutput } from "../Interfaces/BinaryOutput";
import { Gate } from "../Interfaces/Gate";

export default function deepCopyComponent(
    gates: {[key: string]: Gate}, 
    inputs: {[key: string]: BinaryInput},
    outputs: {[key: string]: BinaryOutput}
){
    const newInputs = deepCopyInputs(inputs);
    const newOutputs = deepCopyOutputs(outputs);
    const newGates = deepCopyNestedGates(gates);
    return {newInputs, newOutputs, newGates};
}

function deepCopyGate(gate: Gate): Gate {
    const copiedGate: Gate = {
        ...gate, // Shallow copy of properties
        position: gate.position ? { ...gate.position } : undefined, // Deep copy of position if exists
        gates: gate.gates ? deepCopyNestedGates(gate.gates) : undefined, // Deep copy of nested gates
        inputs: deepCopyInputs(gate.inputs), // Deep copy of inputs
        outputs: deepCopyOutputs(gate.outputs), // Deep copy of outputs
    };
    return copiedGate;
}

function deepCopyNestedGates(gates: {[key: string]: Gate}){
    const newGates: {[key: string]: Gate} = {};
    Object.entries(gates).forEach(([key, gate]) => {
        newGates[key] = deepCopyGate(gate);
    })
    return newGates;
}

function deepCopyInputs(inputs: {[key: string]: BinaryInput}){
    const newInputs: {[key: string]: BinaryInput} = {};
    Object.entries(inputs).forEach(([key, input]) => {
        newInputs[key] = {
            ...input,
            position: input.position ? {...input.position} : undefined,
            style: input.style ? {...input.style} : null,
            to: input.to ? input.to.map((link) => {return {...link}}) : undefined,
            from: input.from ? {...input.from} : undefined,
        }
    })
    return newInputs;
}

function deepCopyOutputs(outputs:{[key: string]: BinaryOutput}){
    const newOutputs: {[key: string]:BinaryOutput} = {};
    Object.entries(outputs).forEach(([key,output]) => {
        newOutputs[key] = {
            ...output,
            from: output.from ? {...output.from} : undefined,
            to: output.to ? output.to.map(link => {return {...link}}) : undefined,
            style: output.style ? {...output.style} : undefined,
            position: output.position ? {...output.position} : undefined,
        }
    })
    return newOutputs;
}