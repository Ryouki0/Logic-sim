import { getTokenSourceMapRange } from 'typescript';
import { Gate } from '../Interfaces/Gate';
import reducer, {addGate, entities} from '../state/slices/entities';
import exp from 'constants';
import { connect } from 'react-redux';
import { Output } from '../Components/Output';

describe('addGate', () => {
	const initialState = {
		gates: {},
		binaryIO: {},
		wires: {},
		bluePrints: {gates: {
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
			layer1_MainGate: {
				name: 'layer1_MainGate',
				id: 'layer1_MainGate',
				parent: 'layer2_MainGate',
				inputs: ['layer1_MainGate_Input1', 'layer1_MainGate_Input2'],
				gates: ['layer1_SubAndGate', 'layer1_SubNoGate'],
				outputs: ['layer1_MainGate_Output1', 'layer1_MainGate_Output2'],
			},
			layer1_SubAndGate: {
				name: 'layer1_SubAndGate',
				id: 'layer1_SubAndGate',
				parent: 'layer1_MainGate',
				inputs: ['layer1_SubAndGate_Input1', 'layer1_SubAndGate_Input2'],
				outputs: ['layer1_SubAndGate_Output1']
			},
			layer1_SubNoGate: {
				name: 'layer1_SubNoGate',
				id: 'layer1_SubNoGate',
				parent:'layer1_MainGate',
				inputs: ['layer1_SubNoGate_Input1'],
				outputs: ['layer1_SubNoGate_Output1']
			},
			layer2_MainGate: {
				name: 'layer2_MainGate',
				id: 'layer2_MainGate',
				parent: 'layer3_MainGate',
				inputs: ['layer2_MainGate_Input1', 'layer2_MainGate_Input2'],
				outputs: ['layer2_MainGate_Output1'],
				gates: ['layer1_MainGate', 'layer2_SubAndGate', 'layer2_SubNoGate']
			},
			layer2_SubAndGate: {
				name: 'layer2_SubAndGate',
				id: 'layer2_SubAndGate',
				parent: 'layer2_MainGate',
				inputs: ['layer2_SubAndGate_Input1', 'layer2_SubAndGate_Input2'],
				outputs: ['layer2_SubAndGate_Output1']
			},
			layer2_SubNoGate: {
				name: 'layer2_SubNoGate',
				id: 'layer2_SubNoGate',
				parent:'layer2_MainGate',
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
			layer1_MainGate_Input1: {
				id: 'layer1_MainGate_Input1',
				state: 0,
				parent: 'layer2_MainGate',
				type: 'input',
				to: [{id: 'layer1_SubAndGate_Input1', gateId: 'layer1_SubAndGate', type: 'input'}],
				isGlobalIo: true
			},
			layer1_MainGate_Input2: {
				id: 'layer1_MainGate_Input2',
				state: 0,
				parent: 'layer2_MainGate',
				type: 'input',
				to: [{id: 'layer1_SubAndGate_Input2', gateId: 'layer1_SubAndGate', type: 'input'}],
				isGlobalIo: true
			},
			layer1_MainGate_Output1: {
				id: 'layer1_MainGate_Output1',
				state: 0,
				parent: 'layer2_MainGate',
				to: [],
				from: {id: 'layer1_SubNoGate_Output1', gateId: 'layer1_SubNoGate', type: 'output'},
				isGlobalIo: true,
				type: 'output'
			},
			layer1_MainGate_Output2: {
				id: 'layer1_MainGate_Output2',
				state: 0,
				parent: 'layer2_MainGate',
				to: [],
				isGlobalIo: true,
				type: 'output'
			},
			layer1_SubAndGate_Input1: {
				id: 'layer1_SubAndGate_Input1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer1_MainGate_Input1', gateId: 'layer1_MainGate', type: 'input'},
				isGlobalIo: false
			},
			layer1_SubAndGate_Input2: {
				id: 'layer1_SubAndGate_Input2',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer1_MainGate_Input2', gateId: 'layer1_MainGate', type: 'input'},
				isGlobalIo: false
			},
			layer1_SubAndGate_Output1: {
				id: 'layer1_SubAndGate_Output1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'output',
				to: [{id: 'layer1_SubNoGate_Input1', gateId: 'layer1_SubNoGate', type: 'input'}],
				isGlobalIo: false
			},
			layer1_SubNoGate_Input1: {
				id: 'layer1_SubNoGate_Input1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer1_SubAndGate_Output1', gateId: 'layer1_SubAndGate', type: 'output'},
				isGlobalIo: false
			},
			layer1_SubNoGate_Output1: {
				id: 'layer1_SubNoGate_Output1',
				state: 0,
				parent: 'layer1_MainGate',
				type: 'output',
				to: [{id: 'layer1_MainGate_Output1', gateId: 'layer1_MainGate', type: 'output'}],
				isGlobalIo: false
			},

			layer2_MainGate_Input1: {
				id: 'layer2_MainGate_Input1',
				state: 0,
				parent: 'layer3_MainGate',
				type: 'input',
				to: [{id: 'layer2_SubAndGate_Input1', gateId: 'layer2_SubAndGate', type: 'input'}],
				isGlobalIo: true
			},
			layer2_MainGate_Input2: {
				id: 'layer2_MainGate_Input2',
				state: 0,
				parent: 'layer3_MainGate',
				type: 'input',
				to: [{id: 'layer2_SubAndGate_Input2', gateId: 'layer2_SubAndGate', type: 'input'}],
				isGlobalIo: true
			},
			layer2_MainGate_Output1: {
				id: 'layer2_MainGate_Output1',
				state: 0,
				parent: 'layer3_MainGate',
				to: [],
				from: {id: 'layer2_SubNoGate_Output1', gateId: 'layer2_SubNoGate', type: 'output'},
				isGlobalIo: true,
				type: 'output'
			},
			layer2_MainGate_Output2: {
				id: 'layer2_MainGate_Output2',
				state: 0,
				parent: 'layer3_MainGate',
				to: [],
				from: {id: 'layer1_MainGate_Output1', gateId: 'layer1_MainGate', type: 'output'},
				isGlobalIo: true,
				type: 'output'
			},
			layer2_SubAndGate_Input1: {
				id: 'layer2_SubAndGate_Input1',
				state: 0,
				parent: 'layer2_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer2_MainGate_Input1', gateId: 'layer2_MainGate', type: 'input'},
				isGlobalIo: false
			},
			layer2_SubAndGate_Input2: {
				id: 'layer2_SubAndGate_Input2',
				state: 0,
				parent: 'layer2_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer2_MainGate_Input2', gateId: 'layer2_MainGate', type: 'input'},
				isGlobalIo: false
			},
			layer2_SubAndGate_Output1: {
				id: 'layer2_SubAndGate_Output1',
				state: 0,
				parent: 'layer2_MainGate',
				type: 'output',
				to: [{id: 'layer2_SubNoGate_Input1', gateId: 'layer2_SubNoGate', type: 'input'}],
				isGlobalIo: false
			},
			layer2_SubNoGate_Input1: {
				id: 'layer2_SubNoGate_Input1',
				state: 0,
				parent: 'layer2_MainGate',
				type: 'input',
				to: [],
				from: {id: 'layer2_SubAndGate_Output1', gateId: 'layer2_SubAndGate', type: 'output'},
				isGlobalIo: false
			},
			layer2_SubNoGate_Output1: {
				id: 'layer2_SubNoGate_Output1',
				state: 0,
				parent: 'layer2_MainGate',
				type: 'output',
				to: [{id: 'layer2_MainGate_Output1', gateId: 'layer2_MainGate', type: 'output'}],
				isGlobalIo: false
			},
			
		}}
	} as entities;
	it('should add an AND gate to the state', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates["and1"]));
		let andGateId = '';
		let supposedAndGate: Gate | null = null;
		Object.entries(newState.gates).forEach(([key, gate]) => {
			andGateId = key;
			supposedAndGate = gate;
		});
		expect(Object.keys(newState.gates).length).toBe(1);
		expect(supposedAndGate!.id).not.toBe('and1');
		expect(supposedAndGate!.name).toBe('AND');
		expect(supposedAndGate!.inputs[0]).not.toBe('andInput1');
		expect(supposedAndGate!.inputs[1]).not.toBe('andInput2');
		expect(supposedAndGate!.outputs[0]).not.toBe('andOutput1');
		expect(newState.binaryIO[supposedAndGate!.inputs[1]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].gateId).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].gateId).toBe(andGateId);
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].gateId).toBe(andGateId);
		expect(newState.binaryIO[supposedAndGate!.outputs[0]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.outputs[0]].gateId).toBe(andGateId);
	});
	it('should add a NO gate to the state', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates['no1']));
		let noGateId = '';
		let supposedNoGate: Gate | null = null;
		Object.entries(newState.gates).forEach(([key, gate]) => {
			noGateId = key;
			supposedNoGate = gate;
		});
		expect(Object.keys(newState.gates).length).toBe(1);
		expect(noGateId).not.toBe('no1');
		expect(supposedNoGate!.name).toBe('NO');
		expect(supposedNoGate!.inputs[0]).not.toBe('noInput1');
		expect(supposedNoGate!.outputs[0]).not.toBe('noOutput1');
		expect(supposedNoGate!.id).not.toBe('no1');
		expect(newState.binaryIO[supposedNoGate!.inputs[0]].id).not.toBe('noInput1');
		expect(newState.binaryIO[supposedNoGate!.outputs[0]].id).not.toBe('noOutput1');
		expect(newState.binaryIO[supposedNoGate!.inputs[0]].gateId).toBe(noGateId);
		expect(newState.binaryIO[supposedNoGate!.outputs[0]].gateId).toBe(noGateId);
	});
	it('should add a 1 layer deep nested gate into the state, with connections', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates['layer1_MainGate']));
		const gateKeys = Object.keys(newState.gates);
		let supposedMainGate: Gate | null = null;
		let supposedAndGate: Gate | null = null;
		let supposedNoGate:Gate | null = null;
		const gateEntries = Object.entries(newState.gates);
		gateEntries.forEach(([key, gate]) => {
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

		const connectedMainGateOutput = newState.binaryIO[mainGateOutputs[0]].from 
			? newState.binaryIO[mainGateOutputs[0]] 
			: newState.binaryIO[mainGateOutputs[1]];

		//The IDs of the gates are changed
		expect(supposedAndGate).toBeDefined();
		expect(supposedMainGate).toBeDefined();
		expect(supposedNoGate).toBeDefined();
		expect(supposedAndGate!.id).not.toBe('layer1_SubAndGate');
		expect(supposedMainGate!.id).not.toBe('layer1_MainGate');
		expect(supposedNoGate!.id).not.toBe('layer1_SubNoGate');

		//The gates' parents are correct
		expect(supposedAndGate!.parent).toBe(supposedMainGate!.id);
		expect(supposedNoGate!.parent).toBe(supposedMainGate!.id);
		expect(supposedMainGate!.parent).toBe('layer2_MainGate');

		//The and gate's inputs have the right "gateId" and changed IDs
		expect(newState.binaryIO[supposedAndGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[1]]).toBeDefined();
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].id).not.toBe('layer1_SubAndGate_Input1');
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].id).not.toBe('layer1_SubAndGate_Input2');
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].gateId).toBe(supposedAndGate!.id);
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].gateId).toBe(supposedAndGate!.id);

		//The main gate's inputs are connected to the and gate's inputs
		expect(mainGateInputIds).toContain(newState.binaryIO[supposedAndGate!.inputs[0]].from!.id);
		expect(mainGateInputIds).toContain(newState.binaryIO[supposedAndGate!.inputs[1]].from!.id);
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].from?.type).toBe('input');
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].from?.type).toBe('input');
		expect(newState.binaryIO[supposedAndGate!.inputs[0]].from?.gateId).toBe(supposedMainGate!.id);
		expect(newState.binaryIO[supposedAndGate!.inputs[1]].from?.gateId).toBe(supposedMainGate!.id);
		expect(andGateInputIds).toContain(newState.binaryIO[mainGateInputIds[0]].to?.[0].id);
		expect(andGateInputIds).toContain(newState.binaryIO[mainGateInputIds[1]].to?.[0].id);

		//The and gate is connected to the no gate
		expect(newState.binaryIO[andGateOutput]).toBeDefined();
		expect(newState.binaryIO[andGateOutput].from).toBeFalsy();
		expect(newState.binaryIO[andGateOutput].to).toBeDefined();
		expect(newState.binaryIO[andGateOutput].to?.[0].id).toBe(noGateInputIds[0]);
		expect(newState.binaryIO[andGateOutput].to?.[0].gateId).toBe(supposedNoGate!.id);
		expect(newState.binaryIO[andGateOutput].to?.[0].type).toBe('input');
		
		expect(newState.binaryIO[noGateInputIds[0]]).toBeDefined();
		expect(newState.binaryIO[noGateInputIds[0]].id).not.toBe('layer1_SubNoGate_Input1');
		expect(newState.binaryIO[noGateInputIds[0]].from).toBeDefined();
		expect(newState.binaryIO[noGateInputIds[0]].from!.id).toBe(andGateOutput);
		expect(newState.binaryIO[noGateInputIds[0]].from!.type).toBe('output');
		expect(newState.binaryIO[noGateInputIds[0]].from!.gateId).toBe(supposedAndGate!.id);

		//Ensure the NO gate is connected to the output of the main gate
		expect(newState.binaryIO[noGateOutput]).toBeDefined();
		expect(newState.binaryIO[noGateOutput].id).not.toBe('layer1_SubNoGate_Output1');
		expect(newState.binaryIO[noGateOutput].gateId).toBe(supposedNoGate!.id);
		expect(newState.binaryIO[noGateOutput].from).toBeFalsy();
		expect(newState.binaryIO[noGateOutput].to?.[0]).toBeDefined();
		expect(mainGateOutputs).toContain(newState.binaryIO[noGateOutput].to![0].id);
		expect(connectedMainGateOutput).toBeDefined();
		expect(connectedMainGateOutput.gateId).toBe(supposedMainGate!.id);
		expect(connectedMainGateOutput.from).toBeDefined();
		expect(connectedMainGateOutput.from!.id).toBe(noGateOutput);
		expect(connectedMainGateOutput.from!.gateId).toBe(supposedNoGate!.id);
		expect(connectedMainGateOutput.from!.type).toBe('output');

		//The blueprints' IDs didn't change
		expect(newState.bluePrints.gates['layer1_MainGate']).toBeDefined();
		expect(newState.bluePrints.gates['layer1_SubAndGate']).toBeDefined();
		expect(newState.bluePrints.gates['layer1_SubNoGate']).toBeDefined();
		expect(newState.bluePrints.io['layer1_MainGate_Input1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_MainGate_Input2']).toBeDefined();
		expect(newState.bluePrints.io['layer1_MainGate_Output1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_MainGate_Output2']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubAndGate_Input1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubAndGate_Input2']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubAndGate_Output1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubNoGate_Input1']).toBeDefined();
		expect(newState.bluePrints.io['layer1_SubNoGate_Output1']).toBeDefined();
	});
	it('should add a 2 layer deep nested gate to the state', () => {
		const newState = reducer(initialState, addGate(initialState.bluePrints.gates['layer2_MainGate']));
		
		let layer2MainGate: Gate|null = null;
		let layer2SubAndGate: Gate |null = null;
		let layer2SubNoGate: Gate| null = null;
		let layer1MainGate: Gate | null = null;
		let layer1SubAndGate: Gate | null = null;
		let layer1SubNoGate: Gate| null = null;
		const gateEntries = Object.entries(newState.gates);
		const ioEntries = Object.entries(newState.binaryIO);
		gateEntries.forEach(([key, gate]) => {
			if(gate.name === 'layer2_MainGate'){
				layer2MainGate = gate;
			}else if(gate.name === 'layer2_SubAndGate'){
				layer2SubAndGate = gate;
			}else if(gate.name === 'layer2_SubNoGate'){
				layer2SubNoGate = gate;
			}else if(gate.name === 'layer1_MainGate'){
				layer1MainGate = gate;
			}else if(gate.name === 'layer1_SubAndGate'){
				layer1SubAndGate = gate;
			}else if(gate.name === 'layer1_SubNoGate'){
				layer1SubNoGate = gate;
			}
		});
		
		const layer2MainGate_InputIds:string[] = [];
		const layer2MainGate_OutputIds: string[] = [];
		
		const layer2SubAndGate_InputIds:string[] = [];
		const layer2SubAndGate_OutputIds:string[] = [];
		
		const layer2SubNoGate_InputIds: string[] = [];
		const layer2SubNoGate_OutputIds: string[] = [];
		
		const layer1MainGate_InputIds: string[] = [];
		const layer1MainGate_OutputIds: string[] = [];

		const layer1SubAndGate_InputIds: string[] = [];
		const layer1SubAndGate_OutputIds: string[] = [];
		
		const layer1SubNoGate_InputIds: string[] = [];
		const layer1SubNoGate_OutputIds: string[] = [];

		ioEntries.forEach(([key, io]) => {
			if(io.type === 'input'){
				if(io.gateId === layer2MainGate!.id){
					layer2MainGate_InputIds.push(key);
				}else if(io.gateId === layer2SubAndGate!.id){
					layer2SubAndGate_InputIds.push(key);
				}else if(io.gateId === layer2SubNoGate!.id){
					layer2SubNoGate_InputIds.push(key);
				}else if(io.gateId === layer1MainGate!.id){
					layer1MainGate_InputIds.push(key);
				}else if(io.gateId === layer1SubAndGate!.id){
					layer1SubAndGate_InputIds.push(key);
				}else if(io.gateId === layer1SubNoGate!.id){
					layer1SubNoGate_InputIds.push(key);
				}
			}else if(io.type === 'output'){
				if(io.gateId === layer2MainGate!.id){
					layer2MainGate_OutputIds.push(key);
				}else if(io.gateId === layer2SubAndGate!.id){
					layer2SubAndGate_OutputIds.push(key);
				}else if(io.gateId === layer2SubNoGate!.id){
					layer2SubNoGate_OutputIds.push(key);
				}else if(io.gateId === layer1MainGate!.id){
					layer1MainGate_OutputIds.push(key);
				}else if(io.gateId === layer1SubAndGate!.id){
					layer1SubAndGate_OutputIds.push(key);
				}else if(io.gateId === layer1SubNoGate!.id){
					layer1SubNoGate_OutputIds.push(key);
				}
			}
		});

		//The gates are added to the state
		expect(layer1MainGate).toBeDefined();
		expect(layer1SubAndGate).toBeDefined();
		expect(layer1SubNoGate).toBeDefined();
		expect(layer2MainGate).toBeDefined();
		expect(layer2SubNoGate).toBeDefined();
		expect(layer2SubAndGate).toBeDefined();
		expect(Object.entries(newState.gates).length).toBe(6);
		expect(Object.entries(newState.binaryIO).length).toBe(17);

		//The IDs of the gates has changed
		expect(layer1MainGate!.id).not.toBe('layer1_MainGate');
		expect(layer1SubNoGate!.id).not.toBe('layer1_SubNoGate');
		expect(layer1SubAndGate!.id).not.toBe('layer1_SubAndGate');
		expect(layer2MainGate!.id).not.toBe('layer2_MainGate');
		expect(layer2SubNoGate!.id).not.toBe('layer2_SubNoGate');
		expect(layer2SubAndGate!.id).not.toBe('layer2_SubAndGate');

		//The parents of the gates are correct
		expect(layer1MainGate!.parent).toBe(layer2MainGate!.id);
		expect(layer1SubNoGate!.parent).toBe(layer1MainGate!.id);
		expect(layer1SubAndGate!.parent).toBe(layer1MainGate!.id);
		expect(layer2MainGate!.parent).toBe('layer3_MainGate');
		expect(layer2SubAndGate!.parent).toBe(layer2MainGate!.id);
		expect(layer2SubNoGate!.parent).toBe(layer2MainGate!.id);

		//The IO ID's are correct in the gates
		expect(newState.binaryIO[layer2MainGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[layer2MainGate!.inputs[1]]).toBeDefined();
		expect(newState.binaryIO[layer2MainGate!.outputs[0]]).toBeDefined();

		expect(newState.binaryIO[layer2SubAndGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[layer2SubAndGate!.inputs[1]]).toBeDefined();
		expect(newState.binaryIO[layer2SubAndGate!.outputs[0]]).toBeDefined();
		
		expect(newState.binaryIO[layer2SubNoGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[layer2SubNoGate!.outputs[0]]).toBeDefined();
		
		expect(newState.binaryIO[layer1MainGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[layer1MainGate!.inputs[1]]).toBeDefined();
		expect(newState.binaryIO[layer1MainGate!.outputs[0]]).toBeDefined();
		expect(newState.binaryIO[layer1MainGate!.outputs[1]]).toBeDefined();

		expect(newState.binaryIO[layer1SubAndGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[layer1SubAndGate!.inputs[1]]).toBeDefined();
		expect(newState.binaryIO[layer1SubAndGate!.outputs[0]]).toBeDefined();

		expect(newState.binaryIO[layer1SubNoGate!.inputs[0]]).toBeDefined();
		expect(newState.binaryIO[layer1SubNoGate!.outputs[0]]).toBeDefined();

		//The IOs' ID's are changed
		expect(newState.binaryIO[layer1MainGate!.inputs[0]].id).not.toBe('layer1_MainGate_Input1');
		expect(newState.binaryIO[layer1MainGate!.inputs[1]].id).not.toBe('layer1_MainGate_Input2');
		expect(newState.binaryIO[layer1MainGate!.outputs[0]].id).not.toBe('layer1_MainGate_Output1');
		expect(newState.binaryIO[layer1MainGate!.outputs[1]].id).not.toBe('layer1_MainGate_Output2');

		expect(newState.binaryIO[layer1SubAndGate!.inputs[0]].id).not.toBe('layer1_SubAndGate_Input1');
		expect(newState.binaryIO[layer1SubAndGate!.inputs[1]].id).not.toBe('layer1_SubAndGate_Input2');
		expect(newState.binaryIO[layer1SubAndGate!.outputs[0]].id).not.toBe('layer1_SubAnGate_Output1');
		
		expect(newState.binaryIO[layer1SubNoGate!.inputs[0]].id).not.toBe('layer1_SubNoGate_Input1');
		expect(newState.binaryIO[layer1SubNoGate!.outputs[0]].id).not.toBe('layer1_SubNoGate_Output1');
		
		expect(newState.binaryIO[layer2MainGate!.inputs[0]].id).not.toBe('layer2_MainGate_Input1');
		expect(newState.binaryIO[layer2MainGate!.inputs[1]].id).not.toBe('layer2_MainGate_Input2');
		expect(newState.binaryIO[layer2MainGate!.outputs[0]].id).not.toBe('layer2_MainGate_Output1');
		
		expect(newState.binaryIO[layer2SubAndGate!.inputs[0]].id).not.toBe('layer2_SubAndGate_Input1');
		expect(newState.binaryIO[layer2SubAndGate!.inputs[1]].id).not.toBe('layer2_SubAndGate_Input2');
		expect(newState.binaryIO[layer2SubAndGate!.outputs[0]].id).not.toBe('layer2_SubAndGate_Output1');
		
		expect(newState.binaryIO[layer2SubNoGate!.inputs[0]].id).not.toBe('layer2_SubNoGate_Input1');
		expect(newState.binaryIO[layer2SubNoGate!.outputs[0]].id).not.toBe('layer2_SubNoGate_Output1');

		//Check the gate IDs in the IOs
		expect(newState.binaryIO[layer1MainGate!.inputs[0]].gateId).toBe(layer1MainGate!.id);
		expect(newState.binaryIO[layer1MainGate!.inputs[1]].gateId).toBe(layer1MainGate!.id);
		expect(newState.binaryIO[layer1MainGate!.outputs[0]].gateId).toBe(layer1MainGate!.id);
		expect(newState.binaryIO[layer1MainGate!.outputs[1]].gateId).toBe(layer1MainGate!.id);

		expect(newState.binaryIO[layer1SubAndGate!.inputs[0]].gateId).toBe(layer1SubAndGate!.id);
		expect(newState.binaryIO[layer1SubAndGate!.inputs[1]].gateId).toBe(layer1SubAndGate!.id);
		expect(newState.binaryIO[layer1SubAndGate!.outputs[0]].gateId).toBe(layer1SubAndGate!.id);
		
		expect(newState.binaryIO[layer1SubNoGate!.inputs[0]].gateId).toBe(layer1SubNoGate!.id);
		expect(newState.binaryIO[layer1SubNoGate!.outputs[0]].gateId).toBe(layer1SubNoGate!.id);
		
		expect(newState.binaryIO[layer2MainGate!.inputs[0]].gateId).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer2MainGate!.inputs[1]].gateId).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer2MainGate!.outputs[0]].gateId).toBe(layer2MainGate!.id);
		
		expect(newState.binaryIO[layer2SubAndGate!.inputs[0]].gateId).toBe(layer2SubAndGate!.id);
		expect(newState.binaryIO[layer2SubAndGate!.inputs[1]].gateId).toBe(layer2SubAndGate!.id);
		expect(newState.binaryIO[layer2SubAndGate!.outputs[0]].gateId).toBe(layer2SubAndGate!.id);
		
		expect(newState.binaryIO[layer2SubNoGate!.inputs[0]].gateId).toBe(layer2SubNoGate!.id);
		expect(newState.binaryIO[layer2SubNoGate!.outputs[0]].gateId).toBe(layer2SubNoGate!.id);

		//The IOs' parents are correct
		expect(newState.binaryIO[layer1MainGate!.inputs[0]].parent).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer1MainGate!.inputs[1]].parent).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer1MainGate!.outputs[0]].parent).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer1MainGate!.outputs[1]].parent).toBe(layer2MainGate!.id);

		expect(newState.binaryIO[layer1SubAndGate!.inputs[0]].parent).toBe(layer1MainGate!.id);
		expect(newState.binaryIO[layer1SubAndGate!.inputs[1]].parent).toBe(layer1MainGate!.id);
		expect(newState.binaryIO[layer1SubAndGate!.outputs[0]].parent).toBe(layer1MainGate!.id);
		
		expect(newState.binaryIO[layer1SubNoGate!.inputs[0]].parent).toBe(layer1MainGate!.id);
		expect(newState.binaryIO[layer1SubNoGate!.outputs[0]].parent).toBe(layer1MainGate!.id);
		
		expect(newState.binaryIO[layer2MainGate!.inputs[0]].parent).toBe('global');
		expect(newState.binaryIO[layer2MainGate!.inputs[1]].parent).toBe('global');
		expect(newState.binaryIO[layer2MainGate!.outputs[0]].parent).toBe('global');
		
		expect(newState.binaryIO[layer2SubAndGate!.inputs[0]].parent).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer2SubAndGate!.inputs[1]].parent).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer2SubAndGate!.outputs[0]].parent).toBe(layer2MainGate!.id);
		
		expect(newState.binaryIO[layer2SubNoGate!.inputs[0]].parent).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer2SubNoGate!.outputs[0]].parent).toBe(layer2MainGate!.id);

		//The layer 2 main gate is connected to the layer 2 and gate
		expect(newState.binaryIO[layer2MainGate_InputIds[0]].to?.length).toBe(1);
		expect(newState.binaryIO[layer2MainGate_InputIds[1]].to?.length).toBe(1);
		expect(newState.binaryIO[layer2MainGate_InputIds[0]].to?.[0].id).toBe(newState.binaryIO[layer2SubAndGate!.inputs[0]].id);
		expect(newState.binaryIO[layer2MainGate_InputIds[1]].to?.[0].id).toBe(newState.binaryIO[layer2SubAndGate!.inputs[1]].id);
		expect(newState.binaryIO[layer2MainGate_InputIds[0]].to?.[0].gateId).toBe(layer2SubAndGate!.id);
		expect(newState.binaryIO[layer2MainGate_InputIds[1]].to?.[0].gateId).toBe(layer2SubAndGate!.id);
		expect(newState.binaryIO[layer2MainGate_InputIds[0]].to?.[0].type).toBe('input');
		expect(newState.binaryIO[layer2MainGate_InputIds[1]].to?.[0].type).toBe('input');
		
		expect(newState.binaryIO[layer2SubAndGate!.inputs[0]].from!.gateId).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer2SubAndGate!.inputs[1]].from!.gateId).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer2SubAndGate!.inputs[0]].from!.type).toBe('input');
		expect(newState.binaryIO[layer2SubAndGate!.inputs[1]].from!.type).toBe('input');
		expect(newState.binaryIO[layer2SubAndGate!.inputs[0]].from!.id).toBe(layer2MainGate_InputIds[0]);
		expect(newState.binaryIO[layer2SubAndGate!.inputs[1]].from!.id).toBe(layer2MainGate_InputIds[1]);

		//The layer 2 and gate is connected to the layer 2 no gate
		expect(newState.binaryIO[layer2SubAndGate_OutputIds[0]].to?.length).toBe(1);
		expect(newState.binaryIO[layer2SubAndGate_OutputIds[0]].to?.[0].id).toBe(newState.binaryIO[layer2SubNoGate_InputIds[0]].id);
		expect(newState.binaryIO[layer2SubAndGate_OutputIds[0]].to?.[0].gateId).toBe(layer2SubNoGate!.id);
		expect(newState.binaryIO[layer2SubAndGate_OutputIds[0]].to?.[0].type).toBe('input');
		expect(newState.binaryIO[layer2SubNoGate_InputIds[0]].from?.id).toBe(layer2SubAndGate!.outputs[0]);
		expect(newState.binaryIO[layer2SubNoGate_InputIds[0]].from?.gateId).toBe(layer2SubAndGate!.id);
		expect(newState.binaryIO[layer2SubNoGate_InputIds[0]].from?.type).toBe('output');

		//The layer 2 NO gate is connected to the outputs of the layer 2 maingate
		expect(newState.binaryIO[layer2SubNoGate_OutputIds[0]].to?.length).toBe(1);
		expect(newState.binaryIO[layer2SubNoGate_OutputIds[0]].to?.[0].id).toBe(layer2MainGate_OutputIds[0]);
		expect(newState.binaryIO[layer2SubNoGate_OutputIds[0]].to?.[0].gateId).toBe(layer2MainGate!.id);
		expect(newState.binaryIO[layer2SubNoGate_OutputIds[0]].to?.[0].type).toBe('output');
		expect(newState.binaryIO[layer2MainGate_OutputIds[0]].from).toBeDefined();
		expect(newState.binaryIO[layer2MainGate_OutputIds[0]].from?.id).toBe(layer2SubNoGate_OutputIds[0]);
		expect(newState.binaryIO[layer2MainGate_OutputIds[0]].from?.type).toBe('output');
	});
});