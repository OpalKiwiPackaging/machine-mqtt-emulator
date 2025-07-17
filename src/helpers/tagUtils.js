export function generateValue(tag, previousValue = 0) {
    switch (tag.type) {
        case 'bool':
            return Math.random() < 0.5
        case 'int':
            return getRandomInt(tag.min ?? 0, tag.max ?? 100)
        case 'string':
            return 'value'
        case 'bit':
            return simulateBitChange(previousValue& 0xFFFF) // Ensure 16-bit limit
        default:
            return null
    }
}


export function simulateBitChange(prevValue = 0) {
    const bit = getRandomInt(0, 15)           // Pick random bit position
    return prevValue ^ (1 << bit)             // Flip the bit using XOR
}

import { getRandomInt } from './mqttHelpers.js'
