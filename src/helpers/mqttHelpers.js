/**
 * Format an MQTT message as a single-field JSON payload,
 * e.g. { "DoorSensor_Right": true }
 */
export function formatValue(value, type, tagName) {
    const payload = {};
    payload[tagName] = type === 'bool' ? !!value : value;
    return JSON.stringify(payload);
}

/**
 * Get a random integer between min and max (inclusive).
 */
export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
