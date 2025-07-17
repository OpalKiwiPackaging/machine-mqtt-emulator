import fs from 'fs'

export function loadCounter(filePath) {
    try {
        const saved = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
        return saved.count ?? 0
    } catch {
        return 0
    }
}

export function saveCounter(filePath, value) {
    fs.writeFileSync(filePath, JSON.stringify({ count: value }))
}
