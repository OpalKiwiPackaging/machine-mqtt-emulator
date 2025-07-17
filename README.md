# MQTT Machine Emulator

This is a production-ready MQTT-based machine emulator that simulates industrial machinery and control system behavior. It publishes JSON-formatted tag data to an MQTT broker, suitable for use with platforms like **Ignition MQTT Engine**.

---

## 🔧 Configuration

### `base.json`

Located in `config/base.json`, this file defines global MQTT settings and the tag structure for all simulated machines.

#### Global MQTT Settings

```json
"mqtt": {
  "host": "${MQTT_HOST}"
}
```

- `host`: Injected from your `.env` file (supports `mqtt://` or `mqtts://`)

#### Machine Definition

```json
"machine": {
  "topicTemplate": "Edge Nodes/TestEm/{machineId}",
  "tags": [ ... ]
}
```

- `topicTemplate`: Used to determine the MQTT topic. `{machineId}` is dynamically replaced.
- Tags are published as JSON objects with the tag name as the key.

---

## 🏷️ Tag Structure

Each tag has the following properties:

| Property         | Type     | Description                                      |
|------------------|----------|--------------------------------------------------|
| `name`           | string   | Tag name (used as key in JSON payload)          |
| `type`           | string   | One of `int`, `bool`, `string`, `bit`           |
| `value`          | any      | Optional fixed value                            |
| `options`        | array    | For `string` type: a list of rotating values    |
| `min`/`max`      | number   | For `int`/`bit` types to define value range     |
| `interval`       | number   | Update interval in seconds (not yet enforced)   |
| `chanceToUpdate` | float    | Chance of change on each cycle (0.0 to 1.0)     |
| `minDelayMs`     | number   | `CycleCount` only: minimum delay between ticks  |
| `maxDelayMs`     | number   | `CycleCount` only: maximum delay between ticks  |
| `stepSize`       | number   | `CycleCount` only: how much to increment        |

---

## 🔌 Output Format

All tag data is published as a **JSON object**, where each message is structured like this:

**Topic:**
```
Edge Nodes/TestEm/machine1
```

**Payload:**
```json
{ "DoorSensor_Left": false }
```

---

## 🐳 Docker Setup

### 1. Dockerfile

```Dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "src/index.js"]
```

### 2. docker-compose.yml

```yaml
version: '3.8'

services:
  emulator:
    build: .
    container_name: emulator_all
    environment:
      - CONFIG=/app/config/base.json
      - MACHINES=6
      - MQTT_USERNAME=youruser
      - MQTT_PASSWORD=yourpass
      - MQTT_CLIENT_ID=emulator
    volumes:
      - ./config:/app/config:ro
      - ./state:/app/state
```

### 3. Run the App

```bash
docker compose build
docker compose up -d
docker logs -f emulator_all
```

---

## 📁 Project Structure

```
machine-emulator/
├── config/
│   └── base.json
├── state/
├── src/
│   ├── index.js
│   └── helpers/
│       ├── mqttHelpers.js
│       ├── tagUtils.js
│       └── fileUtils.js
├── .env
├── Dockerfile
└── docker-compose.yml
```

---

## ✅ Features

- JSON tag publishing format
- Compatible with Ignition MQTT Engine
- `CycleCount` with persistent per-machine state
- Pushbuttons, IO, drives, bitfields
- Customizable update timing per tag
- Dockerized and scalable
