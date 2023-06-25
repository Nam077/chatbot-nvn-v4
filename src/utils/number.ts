export const getRanDomBetween = (min: number, max: number): number => {
    if (min > max) {
        const temp = min;
        min = max;
        max = temp;
    }
    return (Math.floor(Math.random() * 1000000000000000) % (max - min + 1)) + min;
};
