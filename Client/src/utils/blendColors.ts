
export function blendColors(color1: string, color2: string): string {
    const extractRGB = (color: string): [number, number, number] => {
        const match = color.match(/\d+/g);
        if (!match || match.length < 3) {
            throw new Error("Invalid color format");
        }
        return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])];
    };

    const [r1, g1, b1] = extractRGB(color1);
    const [r2, g2, b2] = extractRGB(color2);

    const r = Math.round((0.6*r1 + 0.4*r2) / 1);
    const g = Math.round((0.6*g1 + 0.4*g2) / 1);
    const b = Math.round((0.6*b1 + 0.4*b2) / 1);

    return `rgb(${r}, ${g}, ${b})`;
}