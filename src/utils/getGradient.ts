export const getGradient = (startColor: string, endColor: string, direction: string = 'to bottom') => {
    return `linear-gradient(${direction}, ${startColor}, ${endColor})`;
};