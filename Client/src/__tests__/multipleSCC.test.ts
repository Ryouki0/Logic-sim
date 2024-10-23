
import { entities, Gate } from '@Shared/interfaces';
import fs from 'fs';
import path from 'path';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { getAllBaseGates, globalSort } from '../utils/clock';

describe('multipleSCC', () => {
    const fixture = path.resolve(__dirname, '../../fixtures/multipleSCC.json');
    const data:entities = JSON.parse(fs.readFileSync(fixture, 'utf-8'));
    const combinedGates: {[key: string]: Gate} = {...data.gates};
    const combinedIo: {[key: string]: BinaryIO} = {...data.binaryIO};

    Object.entries(data.currentComponent.gates).forEach(([key, gate]) => {
        combinedGates[key] = gate;
    })
    Object.entries(data.currentComponent.binaryIO).forEach(([key, io]) => {
        combinedIo[key] = io;
    })

    it('Should get the full path with multiple SCCs', () => {
        const {mainDag, SCCOrder} = globalSort(combinedGates, combinedIo);
        const globalOrder = [...mainDag, ...SCCOrder];
        expect(globalOrder.length).toBe(7);
        expect(combinedGates[globalOrder[0]].name).toBe('DELAY');
        expect(combinedGates[combinedGates[globalOrder[0]].parent].name).not.toBe('global');
        expect(combinedGates[globalOrder[1]].name).toBe('NO');

        expect(combinedGates[globalOrder[2]].name).toBe('DELAY');
        expect(combinedGates[globalOrder[3]].name).toBe('DELAY');
        expect(combinedGates[globalOrder[4]].name).toBe('DELAY');

        expect(combinedGates[globalOrder[5]].name).toBe('DELAY');
        expect(combinedGates[globalOrder[6]].name).toBe('AND');
        
    })
})