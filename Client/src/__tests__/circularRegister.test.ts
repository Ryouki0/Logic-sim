import path from "path";
import fs from 'fs';
import { entities, Gate } from "@Shared/interfaces";
import { BinaryIO } from "../Interfaces/BinaryIO";
import { getAllBaseGates, getGlobalDag, globalTopologicalSort } from "../utils/clock";
describe('circularRegister', () => {
    const fixture = path.resolve(__dirname, '../../fixtures/CircularRegister2.json');
    const data: entities = JSON.parse(fs.readFileSync(fixture, 'utf-8'));
    
    const combinedGates: {[key: string]: Gate} = {...data.gates};
    const combinedIo: {[key: string]: BinaryIO} = {...data.binaryIO};

    Object.entries(data.currentComponent.gates).forEach(([key, gate]) => {
        combinedGates[key] = gate;
    })
    Object.entries(data.currentComponent.binaryIO).forEach(([key, io]) => {
        combinedIo[key] = io;
    })

    it('Should get the complete path', () => {
        const baseGateIds = getAllBaseGates(combinedGates);
        const mainDag = getGlobalDag(combinedGates, combinedIo, baseGateIds);
        const mainDagSet = new Set(mainDag);
        const allRemainingGateIds = baseGateIds.filter(id => !mainDagSet.has(id));

        expect(allRemainingGateIds.length).toBe(12);

        let delayGate: null | Gate = null;
        allRemainingGateIds.forEach(id => {
            if(combinedGates[id].name === 'DELAY'){
                delayGate = combinedGates[id];
            }
        })
        const SCC = globalTopologicalSort(delayGate!, combinedGates, combinedIo, baseGateIds, allRemainingGateIds);

        expect(mainDag.length).toBe(0);
        expect(SCC.length).toBe(12);
        expect(combinedGates[SCC[0]].name).toBe('DELAY')
        expect(combinedGates[SCC[1]].name).toBe('NO');
        expect(combinedGates[combinedGates[SCC[1]].parent].name).toBe('NOR');

        expect(combinedGates[SCC[2]].name).toBe('SWITCH');
        expect(combinedGates[SCC[3]].name).toBe('NO');
        expect(combinedGates[SCC[3]].parent).toBe('global');

        expect(combinedGates[SCC[4]].name).toBe('AND');
        expect(combinedGates[combinedGates[SCC[4]].parent].name).toBe('Register');

        expect(combinedGates[SCC[5]].name).toBe('NO');
        expect(combinedGates[combinedGates[SCC[5]].parent].name).toBe('Register');

        expect(combinedGates[SCC[6]].name).toBe('AND');
        expect(combinedGates[combinedGates[SCC[6]].parent].name).toBe('Register');

        expect(combinedGates[SCC[7]].name).toBe('NO');
        expect(combinedGates[combinedGates[SCC[7]].parent].name).toBe('NOR');

        expect(combinedGates[SCC[8]].name).toBe('AND');
        expect(combinedGates[combinedGates[SCC[8]].parent].name).toBe('NOR');
    })
})