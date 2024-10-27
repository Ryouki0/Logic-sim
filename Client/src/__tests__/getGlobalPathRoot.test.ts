import { entities, Gate } from '@Shared/interfaces';
import * as fs from 'fs';
import path from 'path';
import { BinaryIO } from '../Interfaces/BinaryIO';
import { getAllBaseGates, getConnectedGates, getGlobalPathRoot } from '../utils/clock';

describe('getGlobalPathRoot', () => {
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

	it('should check the forward connections', () => {
		const baseGateIds = getAllBaseGates(combinedGates);
		const roots = getGlobalPathRoot(combinedGates, combinedIo, baseGateIds);
		expect(roots.length).toBe(3);
		expect(combinedGates[roots[0]].name).toBe('NO');
		expect(combinedGates[roots[1]].name).toBe('NO');
		expect(combinedGates[roots[2]].name).toBe('NO');

		let outsideNo: Gate | null = null;
		let outsideNoIdx = -1;
		roots.forEach((id, idx) => {
			if(data.currentComponent.gates[id]){
				outsideNo = data.currentComponent.gates[id];
				outsideNoIdx = idx;
			}
		});
		roots.splice(outsideNoIdx, 1);
		const insideNos = [...roots];
		expect(outsideNo!.parent).toBe('global');
		expect(insideNos.length).toBe(2);
        
		const outsideNoFC = getConnectedGates(outsideNo!, combinedIo, baseGateIds);
		expect(outsideNoFC.length).toBe(3);
		expect(combinedGates[outsideNoFC[0]].name).toBe('SWITCH');
		expect(combinedGates[outsideNoFC[1]].name).toBe('SWITCH');
		expect(combinedGates[outsideNoFC[2]].name).toBe('SWITCH');

		const insideNoFC = getConnectedGates(combinedGates[insideNos[0]!], combinedIo, baseGateIds);
		expect(insideNoFC.length).toBe(1);
		expect(combinedGates[insideNoFC[0]].name).toBe('AND');

		const insideNoFC2 = getConnectedGates(combinedGates[insideNos[1]!], combinedIo, baseGateIds);
		expect(insideNoFC2.length).toBe(1);
		expect(combinedGates[insideNoFC2[0]].name).toBe('AND');
	});
});