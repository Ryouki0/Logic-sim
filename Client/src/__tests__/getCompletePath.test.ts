import path from "path";
import * as fs from 'fs';
import { buildPath } from "../utils/clock";
import { Gate } from "@Shared/interfaces";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { entities } from "../state/slices/entities";
describe('getCompletePath', () => {
    const commonEntities = path.resolve(__dirname, '../../fixtures/commonEntities.json');
    let initialState:entities = JSON.parse(fs.readFileSync(commonEntities, 'utf8'));
    it('Should get the complete path in the common entities', () => {

        const combinedGates:{[key: string]: Gate} = {};        
        const currentGateEntries = Object.entries(initialState.currentComponent.gates);
        currentGateEntries.forEach(([key, gate]) => {
            combinedGates[key] = gate;
        });
        Object.entries(initialState.gates).forEach(([key, gate]) => {
            combinedGates[key] = gate;
        });

        const combinedIo: {[key: string]: BinaryIO} = {};
        Object.entries(initialState.currentComponent.binaryIO).forEach(([key, io]) => {
            combinedIo[key] = io;
        });
        Object.entries(initialState.binaryIO).forEach(([key, io]) => {
            combinedIo[key] = io; 
        })

        const completePath = buildPath(combinedGates, combinedIo);

        //1 Bit RAM
        expect(combinedGates[completePath[0]].name).toBe('AND');
        expect(combinedGates[completePath[1]].name).toBe('NO');
        expect(combinedGates[completePath[2]].name).toBe('AND');
        expect(combinedGates[completePath[3]].name).toBe('DELAY');
        expect(combinedGates[completePath[4]].name).toBe('NO');
        expect(combinedGates[completePath[5]].name).toBe('NO');
        expect(combinedGates[completePath[6]].name).toBe('AND');
        expect(combinedGates[completePath[7]].name).toBe('NO');
        expect(combinedGates[completePath[8]].name).toBe('NO');
        expect(combinedGates[completePath[9]].name).toBe('AND');

        //NO-DELAY SCC
        expect(combinedGates[completePath[10]].name).toBe('DELAY');
        expect(combinedGates[completePath[11]].name).toBe('NO');
        expect(combinedGates[completePath[12]].name).toBe('DELAY');
        expect(combinedGates[completePath[13]].name).toBe('NO');
        expect(combinedGates[completePath[14]].name).toBe('AND');
        expect(completePath.length).toBe(15);
    })
})