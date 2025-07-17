import mqtt from 'mqtt'

/**
 * Connects to an MQTT broker with credentials and a specific client ID.
 *
 * @param {string} mqttHost - The broker URL (e.g., mqtt://localhost)
 * @param {string} machineName - Machine name to embed into client ID
 * @returns {MqttClient} Connected MQTT client
 */
export function connectToBroker(mqttHost, machineName) {
    const options = {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        clientId: `${process.env.MQTT_CLIENT_ID || 'emulator'}-${machineName}`
    }

    const client = mqtt.connect(mqttHost, options)

    client.on('error', err => {
        console.error(`❌ [${machineName}] MQTT Error: ${err.message}`)
    })

    return client
}
