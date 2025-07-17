// fileUtils.js
//
// Provides utility functions for reading and writing persistent tag state
// (e.g. the CycleCount counter) to local JSON files. These are useful for
// maintaining tag state between emulator restarts.

import fs from 'fs'

/**
 * Load the persistent CycleCount value from a file.
 * If the file doesn't exist or fails to parse, it defaults to 0.
 *
 * @param {string} filePath - Path to the counter JSON file
 * @returns {number} - The saved count or 0 if not found
 */
export function loadCounter(filePath) {
    try {
        const saved = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        return saved.count ?? 0
    } catch {
        return 0
    }
}

/**
 * Save the CycleCount value to a file as JSON.
 *
 * @param {string} filePath - Path to the counter file
 * @param {number} value - Current value of the counter
 */
export function saveCounter(filePath, value) {
    fs.writeFileSync(filePath, JSON.stringify({ count: value }))
}
