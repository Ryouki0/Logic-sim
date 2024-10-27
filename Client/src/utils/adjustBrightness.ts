export function adjustBrightness(rgb: string, percent: number): string {
	const [r, g, b] = rgb.match(/\d+/g)?.map(Number) ?? [0, 0, 0];

	const adjust = (color: number) => Math.min(255, Math.max(0, color + (color * (percent / 100))));

	const newR = adjust(r);
	const newG = adjust(g);
	const newB = adjust(b);

	return `rgb(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)})`;
}