
export default function compareStringLists(list1: string[], list2: string[]){
	if(list1.length !== list2.length) return false;
	return list1.every((value, index) => value === list2[index]);
}