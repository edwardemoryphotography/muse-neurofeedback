# muse-neurofeedback

> Neurofeedback application for Muse EEG headbands with real-time brain visualization and mindfulness training.

---

## Overview

`muse-neurofeedback` is a Python-based application that connects to the **Muse 2 EEG headband** via Bluetooth, streams real-time brainwave data, and provides live feedback for focus, relaxation, and mindfulness training sessions.

This repo is part of the broader **NeuroCreative Platform** ecosystem — exploring how EEG biometric data can inform creative workflows and neurodivergent execution systems.

---

## Status

| Item | Status |
|------|--------|
| Active Development | ✅ Yes |
| EEG Streaming | ✅ Functional (Python WebSocket) |
| Frontend Viewer | 🔄 In Progress |
| Muse 2 Compatibility | ✅ Verified via Mind Monitor |
| WHOOP Integration | 🔲 Planned |

---

## Features

- Real-time EEG data streaming via Python WebSocket
- Muse 2 headband compatibility (Mind Monitor bridge)
- Live brainwave band visualization (alpha, beta, theta, delta, gamma)
- Mindfulness session tracking and scoring
- Neurofeedback loop for focus training
- Simple frontend to view incoming data streams

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| EEG Hardware | Muse 2 Headband |
| Data Bridge | Mind Monitor (OSC output) |
| Backend | Python, WebSocket (asyncio) |
| Frontend | Minimal HTML/JS viewer |
| Biometric Integration | WHOOP 4.0 (planned) |

---

## Getting Started

### Prerequisites

- Muse 2 headband + Mind Monitor app (iOS/Android)
- Python 3.9+
- Mind Monitor configured to send OSC data to your machine

### Installation

```bash
git clone https://github.com/edwardemoryphotography/muse-neurofeedback.git
cd muse-neurofeedback
pip install -r requirements.txt
```

### Run the Server

```bash
python main.py
```

The WebSocket server will start and listen for incoming OSC data from Mind Monitor.

---

## Roadmap

- [ ] Real-time alpha/theta ratio visualization dashboard
- [ ] Session history logging (JSON/CSV export)
- [ ] WHOOP HRV + EEG correlation view
- [ ] Neurofeedback audio cue system
- [ ] Integration with neurocreative-platform backend
- [ ] Mobile-friendly viewer (PWA)

---

## Related Repos

- [`neurocreative-platform`](https://github.com/edwardemoryphotography/neurocreative-platform) — Unified EEG + WHOOP backend
- [`legacy-codex`](https://github.com/edwardemoryphotography/legacy-codex) — Neurodivergent execution frameworks

---

## Audit Notes

- **Last reviewed**: 2025 — Repo identified as stale-active during GitHub audit
- **Action taken**: README fully documented; development resuming
- **Priority**: High — core component of NeuroCreative stack

---

*Part of the edwardemoryphotography GitHub ecosystem.*
