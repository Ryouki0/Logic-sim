import { create } from "domain";
import reducer, { entities, createBluePrint } from "../state/slices/entities";
import exp from "constants";

describe('createBluePrint', () => {
	const initialState = {
		gates: {
			and1: {
				name: 'AND',
				inputs: ['andInput1', 'andInput2'],
				outputs: ['andOutput1'],
				id: 'and1',
				parent: 'global'
			},
			no1: {
				name: 'NO',
				inputs: ['noInput1'],
				outputs: ['noOutput1'],
				id: 'no1',
				parent: 'global'
			},
		},
		binaryIO: {
			andInput1: {
				id: 'andInput1',
				state: 0,
				gateId: 'and1',
				isGlobalIo: false,
				type: 'input',
				parent: 'global',
				to: []
			},
			andInput2: {
				id: 'andInput2',
				state: 0,
				gateId: 'and1',
				isGlobalIo: false,
				type: 'input',
				parent: 'global',
				to: []
			},
			andOutput1: {
				id: 'andOutput1',
				state: 0,
				gateId: 'and1',
				isGlobalIo: false,
				type: 'output',
				parent: 'global',
				to: []
			},
			noInput1: {
				id: 'noInput1',
				state: 0,
				gateId: 'no1',
				isGlobalIo: false,
				type: 'input',
				parent: 'global',
				to: []
			},
			noOutput1: {
				id: 'noOutput1',
				state: 0,
				gateId: 'no1',
				isGlobalIo: false,
				type: 'output',
				parent: 'global',
				to: []
			},
			globalInput1: {
				id: 'globalInput1',
				state: 0,
				isGlobalIo: true,
				type: 'input',
				parent: 'global',
				to: []
			},
			globalInput2: {
				id: 'globalInput2',
				state: 0,
				isGlobalIo: true,
				type: 'input',
				parent: 'global',
				to: []
			},
			globalOutput1: {
				id: 'globalOutput1',
				state: 0,
				type: 'output',
				parent: 'global',
				to: [],
				isGlobalIo: true
			}
		},
		wires: {},
		bluePrints: {
			gates: {

			}, 
			io: {

			}
		}
	} as entities;

	it('should create a blueprint with an AND an a NO gate inside it', () => {
		const newState = reducer(initialState, createBluePrint({name: 'testName'}));
		const gateEntries = Object.entries(newState.gates);
		const bluePrintGateEntries = Object.entries(newState.bluePrints.gates);
		let mainGateId = '';
		let noId = '';
		let andId = '';
        
		bluePrintGateEntries.forEach(([key, gate]) => {
			if(gate.name !== 'AND' && gate.name !== 'NO'){
				mainGateId = key;
			}else if(gate.name ==='AND'){
				andId = key;
			}else if(gate.name ==='NO'){
				noId = key;
			}
		});
		const mainGate = newState.bluePrints.gates[mainGateId];
		expect(gateEntries.length).toBe(0);
		expect(bluePrintGateEntries.length).toBe(3);
		expect(newState.bluePrints.gates[mainGateId]).toBeDefined();
		expect(newState.bluePrints.gates[mainGateId].gates).toBeDefined();
		expect(newState.bluePrints.gates[mainGateId].gates).toContain(noId);
		expect(newState.bluePrints.gates[mainGateId].gates).toContain(andId);
		//test IO
		expect(newState.bluePrints.io[mainGate.inputs[0]]).toBeDefined();
		expect(newState.bluePrints.io[mainGate.inputs[1]]).toBeDefined();
		expect(newState.bluePrints.io[mainGate.inputs[0]].gateId).toBe(mainGateId);
		expect(newState.bluePrints.io[mainGate.inputs[1]].gateId).toBe(mainGateId);
		expect(newState.bluePrints.io[mainGate.outputs[0]]).toBeDefined();
		expect(newState.bluePrints.io[mainGate.outputs[0]].gateId).toBe(mainGateId);
		expect(newState.bluePrints.io[mainGate.outputs[0]].isGlobalIo).toBe(true);
		expect(newState.bluePrints.io[mainGate.inputs[0]].isGlobalIo).toBe(true);
		expect(newState.bluePrints.io[mainGate.inputs[1]].isGlobalIo).toBe(true);
		expect(newState.bluePrints.io[mainGate.inputs[0]].parent).toBe(mainGateId);
		//test AND and NO gates
		expect(newState.bluePrints.gates[andId]).toBeDefined();
		expect(newState.bluePrints.gates[andId].gates).toBeFalsy();
		expect(newState.bluePrints.gates[andId].parent).toBe(mainGateId);
		expect(newState.bluePrints.gates[noId]).toBeDefined();
		expect(newState.bluePrints.gates[noId].gates).toBeFalsy();
		expect(newState.bluePrints.gates[noId].parent).toBe(mainGateId);
	});
	it('should create a blueprint with a 1 layer deep nested gate, and a global AND and NO gate connected to the nested main gate', () => {
		const initialState = {
            
		};
	});
});