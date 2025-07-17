// mqttPublisher.js
//
// Creates a tag publishing function for a specific machine and MQTT client.
// This encapsulates MQTT message formatting and publishing logic for use
// throughout the emulator. It sends JSON payloads in the format:
// { "tagName": value } to the machine-specific MQTT topic.

import { formatValue } from './mqttHelpers.js'

/**
 * Factory function to create a tag publisher for a specific machine.
 *
 * @param {MqttClient} client - Connected MQTT client instance
 * @param {string} baseTopic - Base MQTT topic for the machine (e.g., "Edge Nodes/TestEm/machine1")
 * @param {string} machineName - Name of the machine (used for logging only)
 * @returns {Function} - A reusable function to publish a tag value
 */
export function createTagPublisher(client, baseTopic, machineName) {
    /**
     * Publish a single tag value to the machine's MQTT topic.
     *
     * @param {string} tagName - The name of the tag (e.g., "CycleCount")
     * @param {any} value - The value to publish
     * @param {string} type - Tag data type (e.g., "int", "bool", "string")
     */
    return function publishTag(tagName, value, type) {
        const payload = formatValue(value, type, tagName)
        client.publish(baseTopic, payload)
        console.log(`[${machineName}] ${baseTopic} = ${payload}`)
    }
}
