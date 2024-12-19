import { BinaryIO } from "../Interfaces/BinaryIO";

/**
 * Gets all the connected IOs. 
 * @param thisIo The starting IO
 * @returns A list of IDs that are connected to this IO, includes the ID of `thisIO`
 * @throws {Error} When there is no IO at a connected ID, in the currentComponent nor in the subIos 
 */
export default function getAllConnectedIO(thisIo: BinaryIO, currentComponentIo: {[key: string]: BinaryIO}, subIo: {[key: string]: BinaryIO}){
	const nextIos: string[] = [thisIo.id];
	const allConnections: string[] = [];
	while(nextIos.length > 0){
		const currentId = nextIos.pop()!;
		const currentIo = currentComponentIo[currentId] ?? subIo[currentId];
		if(!currentIo){
			throw new Error(`There is no IO at ID: ${currentId} when getting all the connections`);
		}

		allConnections.push(currentIo.id);
		currentIo.to?.forEach(to => {
			nextIos.push(to.id);
		});
	}

	return allConnections;
}