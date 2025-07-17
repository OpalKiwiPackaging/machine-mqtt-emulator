import mqtt from 'mqtt'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import process from 'process'
import { fileURLToPath } from 'url'

import { getRandomInt, formatValue } from './helpers/mqttHelpers.js'
import { generateValue } from './helpers/tagUtils.js'
import { loadCounter, saveCounter } from './helpers/fileUtils.js'

dotenv.config()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const configPath = path.resolve(__dirname, process.env.CONFIG || '../config/base.json')
if (!fs.existsSync(configPath) || fs.lstatSync(configPath).isDirectory()) {
    console.error(`❌ CONFIG is not a valid file: ${configPath}`)
    process.exit(1)
}

const baseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
const machineCount = parseInt(process.env.MACHINES || '1', 10)

console.log(`🟢 Starting ${machineCount} machine(s) using shared config`)
for (let i = 1; i <= machineCount; i++) {
    const machineId = `machine${i}`
    startMachine(machineId, baseConfig)
}

function startMachine(machineName, baseConfig) {
    const {
        mqtt: mqttConfig,
        machine: { topicTemplate, tags }
    } = baseConfig

    const tagState = {}
    const counterFile = path.resolve(__dirname, `../state/${machineName}_cycle.json`)

    const cycleTag = tags.find(tag => tag.name === 'CycleCount')
    const minDelay = cycleTag?.minDelayMs ?? 1100
    const maxDelay = cycleTag?.maxDelayMs ?? 2400
    const stepSize = cycleTag?.stepSize ?? 1

    const client = mqtt.connect(mqttConfig.host, {
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        clientId: `${process.env.MQTT_CLIENT_ID || 'emulator'}-${machineName}`
    })

    client.on('connect', () => {
        console.log(`✅ [${machineName}] Connected to MQTT broker`)

        tagState['CycleCount'] = loadCounter(counterFile)
        tags.forEach(tag => {
            tagState[tag.name] = generateValue(tag)
        })

        // 📤 Publish all tags once at startup
        tags.forEach(tag => {
            const value = tagState[tag.name]
            const topic = topicTemplate
                .replace('{machineId}', machineName)
                .replace('{tag}', tag.name)

            client.publish(topic, formatValue(value, tag.type))
            console.log(`📤 [${machineName}] (startup) ${topic} = ${value}`)
        })

        function scheduleNextCycleUpdate() {
            const delay = getRandomInt(minDelay, maxDelay)
            setTimeout(() => {
                tagState['CycleCount'] += stepSize
                saveCounter(counterFile, tagState['CycleCount'])

                const topic = topicTemplate
                    .replace('{machineId}', machineName)
                    .replace('{tag}', 'CycleCount')

                client.publish(topic, String(tagState['CycleCount']))
                console.log(`📤 [${machineName}] ${topic} = ${tagState['CycleCount']} (+${stepSize})`)

                scheduleNextCycleUpdate()
            }, delay)
        }

        scheduleNextCycleUpdate()

        const nonCycleTags = tags.filter(tag => tag.name !== 'CycleCount')
        setInterval(() => {
            const tag = nonCycleTags[Math.floor(Math.random() * nonCycleTags.length)]
            const shouldUpdate = Math.random() < (tag.chanceToUpdate ?? 1)
            if (shouldUpdate) tagState[tag.name] = generateValue(tag)

            const value = tagState[tag.name]
            const topic = topicTemplate
                .replace('{machineId}', machineName)
                .replace('{tag}', tag.name)

            client.publish(topic, formatValue(value, tag.type))
            console.log(`📤 [${machineName}] ${topic} = ${value}`)
        }, getRandomInt(2000, 4000))
    })

    client.on('error', err => {
        console.error(`❌ [${machineName}] MQTT Error: ${err.message}`)
    })
}
