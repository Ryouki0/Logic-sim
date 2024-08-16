import { entities } from "../state/slices/entities";
import * as fs from 'fs';
import path from "path";
import { getPathInComponent } from "../utils/clock";
import { Gate } from "@Shared/interfaces";
import { BinaryIO } from "../Interfaces/BinaryIO";
describe('getPathInComponent', () => {
    const doubleDelayEdgeCase = path.resolve(__dirname, '../../fixtures/doubleDelayEdgeCase.json');
    let initialState: entities = JSON.parse(fs.readFileSync(doubleDelayEdgeCase, 'utf8'));
    it('should build the path for the global component', () => {
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
        let order = getPathInComponent(combinedGates, combinedIo, 'global');

        expect(combinedGates[order[0]].name).toBe('DELAY');
        expect(combinedGates[order[1]].name).toBe('NO');
        expect(combinedGates[order[2]].name).toBe('asd');
        expect(combinedGates[order[3]].name).toBe('2');
        expect(order.length).toBe(4);

        order = getPathInComponent(combinedGates, combinedIo, order[2]);

        expect(order.length).toBe(1);
        expect(combinedGates[order[0]].name).toBe('AND');

        let doubleDelayId = '';
        Object.entries(combinedGates).forEach(([key, gate]) => {
            if(gate.name === '2'){
                doubleDelayId = key;
            }
        })

        order = getPathInComponent(combinedGates, combinedIo, doubleDelayId);

        expect(order.length).toBe(2);
        expect(combinedGates[order[0]].name).toBe('DELAY');
        expect(combinedGates[order[1]].name).toBe('DELAY');
    });
    it('should build the path for a complex common component', () => {
        const commonEntities = path.resolve(__dirname, '../../fixtures/commonEntities.json');
        initialState = JSON.parse(fs.readFileSync(commonEntities, 'utf8'));
        
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

        let order = getPathInComponent(combinedGates, combinedIo, 'global');

        expect(order.length).toBe(6);
        expect(initialState.currentComponent.gates[order[0]].name).toBe('1 Bit RAM');
        expect(initialState.currentComponent.gates[order[1]].name).toBe('DELAY');
        expect(initialState.currentComponent.gates[order[2]].name).toBe('NO');
        expect(initialState.currentComponent.gates[order[3]].name).toBe('DELAY');
        expect(initialState.currentComponent.gates[order[4]].name).toBe('NO');
        expect(initialState.currentComponent.gates[order[5]].name).toBe('AND');

        order = getPathInComponent(combinedGates, combinedIo, order[0]);

        expect(order.length).toBe(6);
        expect(['NO', 'AND']).toContain(combinedGates[order[0]].name);
        expect(['NO','AND']).toContain(combinedGates[order[1]].name);
        expect(combinedGates[order[2]].name).toBe('AND');
        expect(combinedGates[order[3]].name).toBe('DELAY');
        expect(combinedGates[order[4]].name).toBe('NOR');
        expect(combinedGates[order[5]].name).toBe('NOR');
    })
})