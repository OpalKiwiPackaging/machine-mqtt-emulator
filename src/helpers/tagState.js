// tagState.js
//
// Initializes and manages the tag state for a simulated machine.
// This includes loading persistent counters like CycleCount,
// and generating initial values for all tags based on their definitions.

import { generateValue } from './tagUtils.js'

/**
 * Initializes the full tag state for a machine.
 *
 * @param {Array<Object>} tags - List of tag configuration objects from base.json
 * @param {Function} loadCycleCount - Function that loads the persisted cycle count from file
 * @param {string} counterFile - File path for the cycle counter JSON
 * @returns {Object} - An object mapping tag names to their current values
 */
export function initializeTagState(tags, loadCycleCount, counterFile) {
    const state = {}

    // Load persistent CycleCount (or initialize to 0 if no file exists)
    state['CycleCount'] = loadCycleCount(counterFile)

    // Generate initial values for all other tags
    tags.forEach(tag => {
        state[tag.name] = generateValue(tag)
    })

    return state
}
