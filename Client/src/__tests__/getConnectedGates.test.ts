import { entities, Gate } from '@Shared/interfaces';
import * as fs from 'fs';
import path from 'path';
import { getAllBaseGates, getBackConnections, getConnectedGates, getGlobalPathRoot } from '../utils/clock';
import { BinaryIO } from '../Interfaces/BinaryIO';
import exp from 'constants';
describe('getConnectedGates', () => {
	const fixture = path.resolve(__dirname, '../../fixtures/getConnectedGates.json');
	const data:entities = JSON.parse(fs.readFileSync(fixture, 'utf-8'));
	const combinedGates: {[key: string]: Gate} = {...data.gates};
	const combinedIo: {[key: string]: BinaryIO} = {...data.binaryIO};

	Object.entries(data.currentComponent.gates).forEach(([key, gate]) => {
		combinedGates[key] = gate;
	});
	Object.entries(data.currentComponent.binaryIO).forEach(([key, io]) => {
		combinedIo[key] = io;
	});
	it('should check the connections in a simple broken down component', () => {
		const baseGateIds = getAllBaseGates(combinedGates);
		const noGateIds: string[] = [];
		baseGateIds.forEach(id => {
			if(combinedGates[id].name === 'NO'){
				noGateIds.push(id);
			}
		});
		const noGateConnections = getConnectedGates(combinedGates[noGateIds[0]],combinedIo, baseGateIds);
		expect(combinedGates[noGateConnections[0]].name).toBe('AND');
		expect(noGateConnections.length).toBe(1);
        
		const andGateConnections = getConnectedGates(combinedGates[noGateConnections[0]], combinedIo, baseGateIds);
		expect(andGateConnections.length).toBe(1);
		expect(combinedGates[andGateConnections[0]].name).toBe('AND');
		expect(andGateConnections[0]).not.toBe(noGateConnections[0]);

		const otherAndGateConnections = getConnectedGates(combinedGates[andGateConnections[0]], combinedIo, baseGateIds);
		expect(otherAndGateConnections.length).toBe(1);
		expect(combinedGates[otherAndGateConnections[0]].name).toBe('DELAY');

		const delayConnections = getConnectedGates(combinedGates[otherAndGateConnections[0]], combinedIo, baseGateIds);
		expect(delayConnections.length).toBe(0);

		const ANDGateBackConnection = getBackConnections(combinedGates[andGateConnections[0]], combinedIo, baseGateIds);
		expect(ANDGateBackConnection.length).toBe(1);
		expect(combinedGates[ANDGateBackConnection[0]].name).toBe('AND');
		expect(ANDGateBackConnection[0]).toBe(noGateConnections[0]);

		const NORandGateBackConnections = getBackConnections(combinedGates[noGateConnections[0]], combinedIo, baseGateIds);
		expect(NORandGateBackConnections.length).toBe(2);
		expect(combinedGates[NORandGateBackConnections[0]].name).toBe('NO');
		expect(combinedGates[NORandGateBackConnections[1]].name).toBe('NO');
    
		const NORnoGateBackConnections = getBackConnections(combinedGates[NORandGateBackConnections[0]], combinedIo, baseGateIds);
		expect(NORnoGateBackConnections.length).toBe(0);

		const globalRoots = getGlobalPathRoot(combinedGates, combinedIo, baseGateIds);
		expect(globalRoots.length).toBe(2);
		expect(combinedGates[globalRoots[0]].name).toBe('NO');
		expect(combinedGates[globalRoots[1]].name).toBe('NO');
	});
});