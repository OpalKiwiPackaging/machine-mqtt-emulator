import { getRandomInt } from './mqttHelpers.js'

/**
 * Generate a new simulated tag value based on its type and configuration.
 * Supports: bool, int, bit (bitfield), string (from options), and fixed value fallback.
 */
export function generateValue(tag, previousValue = null) {
    // If static value and no options, return directly
    if (tag.value !== undefined && !Array.isArray(tag.options)) {
        return tag.value;
    }

    switch (tag.type) {
        case 'bool':
            return Math.random() < 0.5;

        case 'int':
            return getRandomInt(tag.min ?? 0, tag.max ?? 100);

        case 'bit':
            return simulateBitChange(previousValue || 0);

        case 'string':
            if (Array.isArray(tag.options) && tag.options.length > 0) {
                return tag.options[Math.floor(Math.random() * tag.options.length)];
            }
            return previousValue ?? '';

        default:
            return null;
    }
}

/**
 * Simulate a 16-bit bitfield by flipping one random bit.
 */
export function simulateBitChange(prevValue = 0) {
    const bit = getRandomInt(0, 15); // 16-bit word (bit 0–15)
    return prevValue ^ (1 << bit);   // Flip bit using XOR
}
