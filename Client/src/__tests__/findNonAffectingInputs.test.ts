import { entities, Gate } from "@Shared/interfaces";
import fs from 'fs';
import path from "path";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { getAllBaseGates } from "../utils/clock";
import findNonAffectingInputs from "../utils/findNonAffectingInputs";

describe('findNonAffectingInputs', () => {
    const fixture = path.resolve(__dirname, '../../fixtures/register.json');
    const data:entities = JSON.parse(fs.readFileSync(fixture, 'utf-8'));
    
    const combinedGates: {[key: string]: Gate} = {...data.gates};
    const combinedIo: {[key: string]: BinaryIO} = {...data.binaryIO};

    Object.entries(data.currentComponent.gates).forEach(([key, gate]) => {
        combinedGates[key] = gate;
    })
    Object.entries(data.currentComponent.binaryIO).forEach(([key, io]) => {
        combinedIo[key] = io;
    })
    it('Should find the non affecting inputs in a register', () => {
        const baseGateIds = getAllBaseGates(combinedGates);
        let delayGate = Object.entries(combinedGates).find(([key, gate]) => gate.name === 'DELAY')?.[1];
        let nonAffectingInputs: Set<string> | string[] = findNonAffectingInputs(combinedGates, combinedIo, delayGate!.outputs[0], baseGateIds);

        nonAffectingInputs = Array.from(nonAffectingInputs);
        expect(nonAffectingInputs.length).toBe(2);
        expect(combinedIo[nonAffectingInputs[0]].gateId).toBe(undefined);
        expect(combinedIo[nonAffectingInputs[1]].gateId).toBe(undefined);
        expect(combinedIo[nonAffectingInputs[0]].name).toBe('Value');
        expect(combinedIo[nonAffectingInputs[1]].name).toBe('Save');
    })
})