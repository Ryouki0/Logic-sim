
export default function getType(entity: any){
	if(!entity) return 'undefined';
	if('complexity' in entity) return 'Gate';
	if('from' in entity && !('type' in entity)) return 'Wire';
	if('type' in entity) return 'BinaryIO';
	return 'unknown';
}