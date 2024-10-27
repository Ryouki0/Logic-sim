import { entities, Gate } from '@Shared/interfaces';
import * as fs from 'fs';
import path from 'path';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { getAllBaseGates, getConnectedGates, getGlobalDag, getGlobalPathRoot, globalTopologicalSort } from '../utils/clock';

describe(`getGlobalDag`, () => {
	const fixture = path.resolve(__dirname, '../../fixtures/globalPathRootComplex.json');
	const data: entities = JSON.parse(fs.readFileSync(fixture, 'utf-8'));
	const combinedGates: {[key: string]: Gate} = {...data.gates};
	const combinedIo: {[key: string]: BinaryIO} = {...data.binaryIO};

	Object.entries(data.currentComponent.gates).forEach(([key, gate]) => {
		combinedGates[key] = gate;
	});
	Object.entries(data.currentComponent.binaryIO).forEach(([key, io]) => {
		combinedIo[key] = io;
	});
	it('should get the main DAG of base gates', () => {
		const baseGateIds = getAllBaseGates(combinedGates);
		const mainDag = getGlobalDag(combinedGates, combinedIo, baseGateIds);
       
		expect(mainDag.length).toBe(11);
		expect(baseGateIds.length).toBe(13);
		expect(combinedGates[mainDag[0]].name).toBe('NO');
		expect(combinedGates[mainDag[1]].name).toBe('NO');
		expect(combinedGates[mainDag[2]].name).toBe('NO');
		expect(combinedGates[mainDag[3]].name).toBe('AND');
		expect(combinedGates[mainDag[4]].name).toBe('DELAY');
		expect(combinedGates[mainDag[5]].name).toBe('DELAY');
		expect(combinedGates[mainDag[6]].name).toBe('DELAY');
		expect(combinedGates[mainDag[7]].name).toBe('SWITCH');
		expect(combinedGates[mainDag[8]].name).toBe('SWITCH');
		expect(combinedGates[mainDag[9]].name).toBe('SWITCH');
		expect(combinedGates[mainDag[10]].name).toBe('NO');
	});
	it('should get the SCC', () => {
		const baseGateIds = getAllBaseGates(combinedGates);
		const mainDag = getGlobalDag(combinedGates, combinedIo, baseGateIds);

		const mainDagSet = new Set(mainDag);
		const allRemainingGateIds = baseGateIds.filter(id => !mainDagSet.has(id));
		const SCCOrder: string[] = [];
		const delayGate = combinedGates[allRemainingGateIds[1]];
		const SCC = globalTopologicalSort(delayGate, combinedGates, combinedIo, baseGateIds, allRemainingGateIds);

		expect(allRemainingGateIds.length).toBe(2);
		expect(combinedGates[allRemainingGateIds[1]].name).toBe('DELAY');
		expect(SCC.length).toBe(2);
		expect(combinedGates[SCC[0]].name).toBe('DELAY');
		expect(combinedGates[SCC[1]].name).toBe('NO');
	});
});