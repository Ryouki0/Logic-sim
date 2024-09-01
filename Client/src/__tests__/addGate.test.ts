import { Gate } from '../Interfaces/Gate';
import reducer, {addGate, entities} from '../state/slices/entities';

describe('addGate', () => {
	const initialState = {
		gates: {},
		binaryIO: {},
		wires: {},
		bluePrints: {
			wires: {},
			gates: {
				and1: {
					name: 'AND',
					inputs: ['andInput1', 'andInput2'],
					outputs: ['andOutput1'],
					id: 'and1',
					complexity: 1,
					parent: 'global'
				},
				no1: {
					name: 'NO',
					inputs: ['noInput1'],
					complexity: 1,
					outputs: ['noOutput1'],
					id: 'no1',
					parent: 'global'
				},
				layer1_MainGate: {
					name: 'layer1_MainGate',
					id: 'layer1_MainGate',
					complexity: 2,
					parent: 'layer2_MainGate',
					inputs: ['layer1_MainGate_Input1', 'layer1_MainGate_Input2'],
					gates: ['layer1_SubAndGate', 'layer1_SubNoGate'],
					outputs: ['layer1_MainGate_Output1', 'layer1_MainGate_Output2'],
				},
				layer1_SubAndGate: {
					name: 'layer1_SubAndGate',
					id: 'layer1_SubAndGate',
					parent: 'layer1_MainGate',
					complexity: 1,
					inputs: ['layer1_SubAndGate_Input1', 'layer1_SubAndGate_Input2'],
					outputs: ['layer1_SubAndGate_Output1']
				},
				layer1_SubNoGate: {
					name: 'layer1_SubNoGate',
					id: 'layer1_SubNoGate',
					parent:'layer1_MainGate',
					complexity: 1,
					inputs: ['layer1_SubNoGate_Input1'],
					outputs: ['layer1_SubNoGate_Output1']
				},
				layer2_MainGate: {
					name: 'layer2_MainGate',
					id: 'layer2_MainGate',
					parent: 'layer3_MainGate',
					complexity: 4,
					inputs: ['layer2_MainGate_Input1', 'layer2_MainGate_Input2'],
					outputs: ['layer2_MainGate_Output1'],
					gates: ['layer1_MainGate', 'layer2_SubAndGate', 'layer2_SubNoGate']
				},
				layer2_SubAndGate: {
					name: 'layer2_SubAndGate',
					id: 'layer2_SubAndGate',
					parent: 'layer2_MainGate',
					complexity: 1,
					inputs: ['layer2_SubAndGate_Input1', 'layer2_SubAndGate_Input2'],
					outputs: ['layer2_SubAndGate_Output1']
				},
				layer2_SubNoGate: {
					name: 'layer2_SubNoGate',
					id: 'layer2_SubNoGate',
					parent:'layer2_MainGate',
					complexity: 1,
					inputs: ['layer2_SubNoGate_Input1'],
					outputs: ['layer2_SubNoGate_Output1']
				}

			}, io: {
				andInput1: {
					id: 'andInput1',
					state: 0,
					gateId: 'and1',
					isGlobalIo: false,
					type: 'input',
					name: 'o1',
					parent: 'global',
					to: []
				},
				andInput2: {
					id: 'andInput2',
					state: 0,
					gateId: 'and1',
					isGlobalIo: false,
					type: 'input',
					name: 'o1',
					parent: 'global',
					to: []
				},
				andOutput1: {
					id: 'andOutput1',
					state: 0,
					gateId: 'and1',
					isGlobalIo: false,
					type: 'output',
					name: 'o1',
					parent: 'global',
					to: []
				},
				noInput1: {
					id: 'noInput1',
					state: 0,
					gateId: 'no1',
					isGlobalIo: false,
					type: 'input',
					name: 'o1',
					parent: 'global',
					to: []
				},
				noOutput1: {
					id: 'noOutput1',
					state: 0,
					gateId: 'no1',
					isGlobalIo: false,
					type: 'output',
					name: 'o1',
					parent: 'global',
					to: []
				},
				layer1_MainGate_Input1: {
					id: 'layer1_MainGate_Input1',
					state: 0,
					parent: 'layer2_MainGate',
					name: 'o1',
					type: 'input',
					to: [{id: 'layer1_SubAndGate_Input1', gateId: 'layer1_SubAndGate', type: 'input'}],
					isGlobalIo: true
				},
				layer1_MainGate_Input2: {
					id: 'layer1_MainGate_Input2',
					state: 0,
					parent: 'layer2_MainGate',
					name: 'o1',
					type: 'input',
					to: [{id: 'layer1_SubAndGate_Input2', gateId: 'layer1_SubAndGate', type: 'input'}],
					isGlobalIo: true
				},
				layer1_MainGate_Output1: {
					id: 'layer1_MainGate_Output1',
					state: 0,
					parent: 'layer2_MainGate',
					name: 'o1',
					to: [],
					from: [{id: 'layer1_SubNoGate_Output1', gateId: 'layer1_SubNoGate', type: 'output'}],
					isGlobalIo: true,
					type: 'output'
				},
				layer1_MainGate_Output2: {
					id: 'layer1_MainGate_Output2',
					state: 0,
					parent: 'layer2_MainGate',
					name: 'o1',
					to: [],
					isGlobalIo: true,
					type: 'output'
				},
				layer1_SubAndGate_Input1: {
					id: 'layer1_SubAndGate_Input1',
					state: 0,
					parent: 'layer1_MainGate',
					type: 'input',
					name: 'o1',
					to: [],
					from: [{id: 'layer1_MainGate_Input1', gateId: 'layer1_MainGate', type: 'input'}],
					isGlobalIo: false
				},
				layer1_SubAndGate_Input2: {
					id: 'layer1_SubAndGate_Input2',
					state: 0,
					parent: 'layer1_MainGate',
					type: 'input',
					to: [],
					name: 'o1',
					from: [{id: 'layer1_MainGate_Input2', gateId: 'layer1_MainGate', type: 'input'}],
					isGlobalIo: false
				},
				layer1_SubAndGate_Output1: {
					id: 'layer1_SubAndGate_Output1',
					state: 0,
					parent: 'layer1_MainGate',
					name: 'o1',
					type: 'output',
					to: [{id: 'layer1_SubNoGate_Input1', gateId: 'layer1_SubNoGate', type: 'input'}],
					isGlobalIo: false
				},
				layer1_SubNoGate_Input1: {
					id: 'layer1_SubNoGate_Input1',
					state: 0,
					parent: 'layer1_MainGate',
					type: 'input',
					name: 'o1',
					to: [],
					from: [{id: 'layer1_SubAndGate_Output1', gateId: 'layer1_SubAndGate', type: 'output'}],
					isGlobalIo: false
				},
				layer1_SubNoGate_Output1: {
					id: 'layer1_SubNoGate_Output1',
					state: 0,
					parent: 'layer1_MainGate',
					name: 'o1',
					type: 'output',
					to: [{id: 'layer1_MainGate_Output1', gateId: 'layer1_MainGate', type: 'output'}],
					isGlobalIo: false
				},

				layer2_MainGate_Input1: {
					id: 'layer2_MainGate_Input1',
					state: 0,
					parent: 'layer3_MainGate',
					name: 'o1',
					type: 'input',
					to: [{id: 'layer2_SubAndGate_Input1', gateId: 'layer2_SubAndGate', type: 'input'}],
					isGlobalIo: true
				},
				layer2_MainGate_Input2: {
					id: 'layer2_MainGate_Input2',
					state: 0,
					parent: 'layer3_MainGate',
					name: 'o1',
					type: 'input',
					to: [{id: 'layer2_SubAndGate_Input2', gateId: 'layer2_SubAndGate', type: 'input'}],
					isGlobalIo: true
				},
				layer2_MainGate_Output1: {
					id: 'layer2_MainGate_Output1',
					state: 0,
					parent: 'layer3_MainGate',
					name: 'o1',
					to: [],
					from: [{id: 'layer2_SubNoGate_Output1', gateId: 'layer2_SubNoGate', type: 'output'}],
					isGlobalIo: true,
					type: 'output'
				},
				layer2_MainGate_Output2: {
					id: 'layer2_MainGate_Output2',
					state: 0,
					parent: 'layer3_MainGate',
					name: 'o1',
					to: [],
					from: [{id: 'layer1_MainGate_Output1', gateId: 'layer1_MainGate', type: 'output'}],
					isGlobalIo: true,
					type: 'output'
				},
				layer2_SubAndGate_Input1: {
					id: 'layer2_SubAndGate_Input1',
					state: 0,
					parent: 'layer2_MainGate',
					name: 'o1',
					type: 'input',
					to: [],
					from: [{id: 'layer2_MainGate_Input1', gateId: 'layer2_MainGate', type: 'input'}],
					isGlobalIo: false
				},
				layer2_SubAndGate_Input2: {
					id: 'layer2_SubAndGate_Input2',
					state: 0,
					parent: 'layer2_MainGate',
					type: 'input',
					name: 'o1',
					to: [],
					from: [{id: 'layer2_MainGate_Input2', gateId: 'layer2_MainGate', type: 'input'}],
					isGlobalIo: false
				},
				layer2_SubAndGate_Output1: {
					id: 'layer2_SubAndGate_Output1',
					state: 0,
					parent: 'layer2_MainGate',
					type: 'output',
					name: 'o1',
					to: [{id: 'layer2_SubNoGate_Input1', gateId: 'layer2_SubNoGate', type: 'input'}],
					isGlobalIo: false
				},
				layer2_SubNoGate_Input1: {
					id: 'layer2_SubNoGate_Input1',
					state: 0,
					parent: 'layer2_MainGate',
					type: 'input',
					to: [],
					name: 'i1',
					from: [{id: 'layer2_SubAndGate_Output1', gateId: 'layer2_SubAndGate', type: 'output'}],
					isGlobalIo: false
				},
				layer2_SubNoGate_Output1: {
					id: 'layer2_SubNoGate_Output1',
					state: 0,
					name: 'o1',
					parent: 'layer2_MainGate',
					type: 'output',
					to: [{id: 'layer2_MainGate_Output1', gateId: 'layer2_MainGate', type: 'output'}],
					isGlobalIo: false
				},
			
			}}, currentComponent: {
			gates: {},
			wires: {},
			binaryIO: {},
		}
	} as entities;
	it('should add an AND gate to the state', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates["and1"]));
		let andGateId = '';
		let supposedAndGate: Gate | null = null;
		Object.entries(newState.currentComponent.gates).forEach(([key, gate]) => {
			andGateId = key;
			supposedAndGate = gate;
		});
		expect(Object.keys(newState.currentComponent.gates).length).toBe(1);
		expect(supposedAndGate!.id).not.toBe('and1');
		expect(supposedAndGate!.name).toBe('AND');
		expect(supposedAndGate!.inputs[0]).not.toBe('andInput1');
		expect(supposedAndGate!.inputs[1]).not.toBe('andInput2');
		expect(supposedAndGate!.outputs[0]).not.toBe('andOutput1');
		expect(newState.currentComponent.binaryIO[supposedAndGate!.inputs[1]]).toBeDefined();
		expect(newState.currentComponent.binaryIO[supposedAndGate!.inputs[0]]).toBeDefined();
		expect(newState.currentComponent.binaryIO[supposedAndGate!.inputs[1]].gateId).toBeDefined();
		expect(newState.currentComponent.binaryIO[supposedAndGate!.inputs[1]].gateId).toBe(andGateId);
		expect(newState.currentComponent.binaryIO[supposedAndGate!.inputs[0]].gateId).toBe(andGateId);
		expect(newState.currentComponent.binaryIO[supposedAndGate!.outputs[0]]).toBeDefined();
		expect(newState.currentComponent.binaryIO[supposedAndGate!.outputs[0]].gateId).toBe(andGateId);
	});
	it('should add a NO gate to the state', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates['no1']));
		let noGateId = '';
		let supposedNoGate: Gate | null = null;
		Object.entries(newState.currentComponent.gates).forEach(([key, gate]) => {
			noGateId = key;
			supposedNoGate = gate;
		});
		expect(Object.keys(newState.currentComponent.gates).length).toBe(1);
		expect(noGateId).not.toBe('no1');
		expect(supposedNoGate!.name).toBe('NO');
		expect(supposedNoGate!.inputs[0]).not.toBe('noInput1');
		expect(supposedNoGate!.outputs[0]).not.toBe('noOutput1');
		expect(supposedNoGate!.id).not.toBe('no1');
		expect(newState.currentComponent.binaryIO[supposedNoGate!.inputs[0]].id).not.toBe('noInput1');
		expect(newState.currentComponent.binaryIO[supposedNoGate!.outputs[0]].id).not.toBe('noOutput1');
		expect(newState.currentComponent.binaryIO[supposedNoGate!.inputs[0]].gateId).toBe(noGateId);
		expect(newState.currentComponent.binaryIO[supposedNoGate!.outputs[0]].gateId).toBe(noGateId);
	});
	it('should add a 1 layer deep nested gate into the state, with connections', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates['layer1_MainGate']));
		let supposedMainGate: Gate | null = null;
		let supposedAndGate: Gate | null = null;
		let supposedNoGate:Gate | null = null;
		const currentGateEntries = Object.entries(newState.currentComponent.gates);
		currentGateEntries.forEach(([key, gate]) => {
			if(gate.parent === 'layer2_MainGate'){
				supposedMainGate = gate;
				console.log(`global parent for: ${gate.name}`);
			}else if(gate.name === 'layer1_SubNoGate'){
				supposedNoGate = gate;
			}else if(gate.name === 'layer1_SubAndGate'){
				supposedAndGate = gate;
			}
		});
		const subGateEntries = Object.entries(newState.gates);
		subGateEntries.forEach(([key, gate]) => {
			if(gate.parent === 'layer2_MainGate'){
				supposedMainGate = gate;
				console.log(`global parent for: ${gate.name}`);
			}else if(gate.name === 'layer1_SubNoGate'){
				supposedNoGate = gate;
			}else if(gate.name === 'layer1_SubAndGate'){
				supposedAndGate = gate;
			}
		});
		const ioEntries = Object.entries(newState.binaryIO);
		
		const mainGateInputIds: string[] = [];
		const andGateInputIds: string[] = [];
		const noGateInputIds: string[] = [];

		const mainGateOutputs: string[] = [];
		let andGateOutput: string = '';
		let noGateOutput: string = '';
		ioEntries.forEach(([key, io]) => {
			if(io.gateId === supposedMainGate!.id && io.type === 'input'){
				mainGateInputIds.push(key);
			}else if(io.gateId === supposedAndGate!.id && io.type ==='input'){
				andGateInputIds.push(key);
			}else if(io.gateId === supposedNoGate!.id && io.type === 'input'){
				noGateInputIds.push(key);
			}else if(io.type ==='output' && io.gateId === supposedMainGate!.id){
				mainGateOutputs.push(key);
			}else if(io.type === 'output' && io.gateId === supposedAndGate!.id){
				andGateOutput = key;
			}else if(io.type === 'output' && io.gateId === supposedNoGate!.id){
				noGateOutput = key;
			}
		});
		const subIoEntries = Object.entries(newState.currentComponent.binaryIO);
		subIoEntries.forEach(([key,io]) => {
			if(io.gateId === supposedMainGate!.id && io.type === 'input'){
				mainGateInputIds.push(key);
			}else if(io.gateId === supposedAndGate!.id && io.type ==='input'){
				andGateInputIds.push(key);
			}else if(io.gateId === supposedNoGate!.id && io.type === 'input'){
				noGateInputIds.push(key);
			}else if(io.type ==='output' && io.gateId === supposedMainGate!.id){
				mainGateOutputs.push(key);
			}else if(io.type === 'output' && io.gateId === supposedAndGate!.id){
				andGateOutput = key;
			}else if(io.type === 'output' && io.gateId === supposedNoGate!.id){
				noGateOutput = key;
			}
		});
		const connectedMainGateOutput = newState.currentComponent.binaryIO[mainGateOutputs[0]].from 
			? newState.currentComponent.binaryIO[mainGateOutputs[0]] 
			: newState.currentComponent.binaryIO[mainGateOutputs[1]];
		

		expect(Object.keys(newState.currentComponent.gates).length).toBe(1);
		expect(Object.keys(newState.currentComponent.binaryIO).length).toBe(4);
		expect(supposedMainGate!.id).not.toBe('layer1_MainGate');
		expect(supposedMainGate!.name).toBe('layer1_MainGate');
		expect(supposedMainGate!.complexity).toBe(2);
		expect(newState.currentComponent.binaryIO[mainGateOutputs[0]].from?.length).toBe(1);
		expect(newState.currentComponent.binaryIO[mainGateOutputs[0]].from?.[0].gateId).toBe(supposedNoGate!.id);
		expect(newState.currentComponent.binaryIO[mainGateOutputs[1]].from?.length).toBeFalsy();
		
	});
});