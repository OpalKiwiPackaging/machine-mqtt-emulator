// index.js
//
// MQTT Machine Emulator
// This script emulates one or more industrial machines by generating random telemetry and publishing it to an MQTT broker.
// Features:
// - Random updates for int, bool, bit, and string tags
// - Persistent `CycleCount` tracking per machine
// - Customizable update intervals and randomness
// - JSON-formatted payloads published to a shared topic
// - Modular helpers for state, file persistence, and publishing
// - Multiple machines supported via MACHINES env variable

import mqtt from 'mqtt'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'
import process from 'process'
import { fileURLToPath } from 'url'

import { getRandomInt } from './helpers/mqttHelpers.js'
import { generateValue } from './helpers/tagUtils.js'
import { initializeTagState } from './helpers/tagState.js'
import { saveCounter, loadCounter } from './helpers/fileUtils.js'
import { createTagPublisher } from './helpers/mqttPublisher.js'
import { connectToBroker } from './helpers/mqttClient.js'

// Load environment variables
dotenv.config()
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Load config
const configPath = path.resolve(__dirname, process.env.CONFIG || '../config/base.json')
if (!fs.existsSync(configPath) || fs.lstatSync(configPath).isDirectory()) {
    console.error(`❌ CONFIG is not a valid file: ${configPath}`)
    process.exit(1)
}
const baseConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'))

// Resolve MQTT broker
const mqttHost = process.env.MQTT_HOST || baseConfig.mqtt?.host
if (!mqttHost || mqttHost === 'env') {
    console.error("❌ MQTT_HOST is not defined.")
    process.exit(1)
}

// Launch machine instances
const machineCount = parseInt(process.env.MACHINES || '1', 10)
console.log(`🟢 Starting ${machineCount} machine(s) using shared config`)

for (let i = 1; i <= machineCount; i++) {
    const machineId = `machine${i}`
    startMachine(machineId, baseConfig)
}

function startMachine(machineName, baseConfig) {
    const {
        machine: { topicTemplate, tags }
    } = baseConfig

    const counterFile = path.resolve(__dirname, `../state/${machineName}_cycle.json`)
    const cycleTag = tags.find(tag => tag.name === 'CycleCount')
    const minDelay = cycleTag?.minDelayMs ?? 1100
    const maxDelay = cycleTag?.maxDelayMs ?? 2400
    const stepSize = cycleTag?.stepSize ?? 1

    const client = connectToBroker(mqttHost, machineName)

    client.on('connect', () => {
        console.log(`✅ [${machineName}] Connected to MQTT broker`)

        const baseTopic = topicTemplate.replace('{machineId}', machineName)
        const publishTag = createTagPublisher(client, baseTopic, machineName)
        const tagState = initializeTagState(tags, loadCounter, counterFile)

        // Publish initial values
        tags.forEach(tag => {
            publishTag(tag.name, tagState[tag.name], tag.type)
        })

        // Handle persistent CycleCount tag
        function scheduleNextCycleUpdate() {
            const delay = getRandomInt(minDelay, maxDelay)
            setTimeout(() => {
                tagState['CycleCount'] += stepSize
                saveCounter(counterFile, tagState['CycleCount'])

                publishTag('CycleCount', tagState['CycleCount'], 'int')
                scheduleNextCycleUpdate()
            }, delay)
        }
        scheduleNextCycleUpdate()

        // Interval loop for other tags
        const nonCycleTags = tags.filter(tag => tag.name !== 'CycleCount')
        nonCycleTags.forEach(tag => {
            const intervalMs = (tag.interval ?? 2) * 1000
            setInterval(() => {
                if (Math.random() >= (tag.chanceToUpdate ?? 1)) return

                const oldValue = tagState[tag.name]
                const newValue = generateValue(tag, oldValue || '')

                if (newValue !== oldValue) {
                    tagState[tag.name] = newValue
                    publishTag(tag.name, newValue, tag.type)
                }
            }, intervalMs)
        })
    })

    client.on('error', err => {
        console.error(`❌ [${machineName}] MQTT Error: ${err.message}`)
    })
}
