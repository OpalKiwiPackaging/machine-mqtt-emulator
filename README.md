# MQTT Machine Emulator

This is a production-ready MQTT-based machine emulator for simulating industrial machinery, control systems, and PLC behavior. It publishes machine telemetry to a configured MQTT broker (e.g., Ignition MQTT Engine) with support for:

- Digital and analog tags
- Bitfield simulation (packed IOs)
- Persistent counters (e.g., CycleCount)
- Multiple machine instances (machine1, machine2, ...)
- Random update intervals and values
- Dockerized deployment for scale and consistency

---

## 🔧 Configuration

The main configuration file is `base.json` (inside `/config/`), which defines:

# .env

MQTT_USERNAME=demo
MQTT_PASSWORD=demo
MQTT_CLIENT_ID=emulator

environment:
- MQTT_USERNAME=${MQTT_USERNAME}
- MQTT_PASSWORD=${MQTT_PASSWORD}
- MQTT_CLIENT_ID=${MQTT_CLIENT_ID}

### Global MQTT Settings

```json
"mqtt": {
  "host": "mqtt://your-broker-address"
}
```

- **host**: MQTT broker URL (use `mqtts://` for TLS)

### Machine Definition

```json
"machine": {
  "topicTemplate": "Edge Nodes/TestEm/{machineId}/{tag}",
  "batchMode": false,
  "tags": [...]
}
```

- **topicTemplate**: MQTT topic format. `{machineId}` and `{tag}` are dynamically replaced.
- **batchMode**: (not yet implemented) If enabled, sends all tags in one message.
- **tags[]**: List of tags to simulate.

---

## 🏷️ Tag Structure

Each tag supports:

| Field             | Type     | Description                                    |
|------------------|----------|------------------------------------------------|
| name             | string   | Tag name                                       |
| type             | string   | `int`, `bool`, `string`, or `bit`              |
| value            | any      | Static value (for `bool`/`string`)             |
| min / max        | number   | Range for `int` and `bit` types                |
| interval         | number   | Base interval (seconds) for updates            |
| chanceToUpdate   | float    | Probability to update each interval (0–1)      |
| minDelayMs       | number   | For `CycleCount` tags — min update interval    |
| maxDelayMs       | number   | For `CycleCount` tags — max update interval    |
| stepSize         | number   | Increment step for persistent counters         |

---

## 🐳 Docker Setup

### 1. Dockerfile

A typical `Dockerfile`:

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

### 3. Build & Run

```bash
docker compose build
docker compose up -d
docker logs -f emulator_all
```

---

## 🗂 Project Structure

```
machine-emulator/
├── config/
│   └── base.json
├── state/               # Persistent counters saved here
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

- Persistent `CycleCount` with per-machine state files
- Push buttons, drive tags, IO simulation (bitfields)
- Fully configurable tag list via JSON
- Scalable: run 1 or 100 machines using `MACHINES` env
- Production-ready and easy to extend

---

