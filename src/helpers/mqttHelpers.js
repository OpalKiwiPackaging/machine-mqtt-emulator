export function formatValue(value, type) {
    if (type === 'string') return String(value)
    if (type === 'bool') return value ? 'true' : 'false'
    return String(value)
}

export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
