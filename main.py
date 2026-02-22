#!/usr/bin/env python3
"""
muse-neurofeedback / main.py

Receives OSC data from Mind Monitor (Muse 2 EEG headband)
and broadcasts it in real-time to all connected WebSocket clients.

Usage:
    python main.py

Mind Monitor setup:
    Set OSC Stream Host to your machine's IP address
    Set OSC Port to 5000 (default)

WebSocket endpoint:
    ws://localhost:8765

Data format broadcast to WebSocket clients:
    {
        "timestamp": "2026-02-22T01:00:00.000000",
        "address": "/muse/eeg",
        "args": [1.23, 4.56, 7.89, 0.12]
    }
"""

import asyncio
import json
import logging
import signal
from datetime import datetime, timezone
from typing import Set

from pythonosc.dispatcher import Dispatcher
from pythonosc.osc_server import AsyncIOOSCUDPServer
import websockets
from websockets.server import WebSocketServerProtocol

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

OSC_IP = "0.0.0.0"       # Listen on all interfaces
OSC_PORT = 5000           # Must match Mind Monitor OSC port setting
WS_HOST = "0.0.0.0"      # WebSocket bind address
WS_PORT = 8765            # WebSocket port

LOG_LEVEL = logging.INFO

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=LOG_LEVEL,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("muse-neurofeedback")

# ---------------------------------------------------------------------------
# Connected WebSocket clients
# ---------------------------------------------------------------------------

CLIENTS: Set[WebSocketServerProtocol] = set()


async def broadcast(message: str) -> None:
    """Send a JSON message to every connected WebSocket client."""
    if not CLIENTS:
        return
    # websockets >=10 uses websockets.broadcast; fall back for older versions
    disconnected = set()
    for ws in CLIENTS.copy():
        try:
            await ws.send(message)
        except websockets.ConnectionClosed:
            disconnected.add(ws)
    CLIENTS.difference_update(disconnected)


async def ws_handler(websocket: WebSocketServerProtocol) -> None:
    """Handle a new WebSocket connection."""
    CLIENTS.add(websocket)
    client_addr = websocket.remote_address
    log.info("WS  client connected    %s  (total: %d)", client_addr, len(CLIENTS))
    try:
        # Keep the connection alive; we don't expect incoming messages.
        async for _ in websocket:
            pass
    except websockets.ConnectionClosed:
        pass
    finally:
        CLIENTS.discard(websocket)
        log.info("WS  client disconnected %s  (total: %d)", client_addr, len(CLIENTS))


# ---------------------------------------------------------------------------
# OSC handlers
# ---------------------------------------------------------------------------

def make_osc_handler(loop: asyncio.AbstractEventLoop):
    """Return a generic OSC message handler that broadcasts to WebSocket clients."""

    def _handler(address: str, *args) -> None:
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "address": address,
            "args": list(args),
        }
        message = json.dumps(payload)
        # Schedule coroutine on the running event loop from the OSC thread
        asyncio.run_coroutine_threadsafe(broadcast(message), loop)

    return _handler


EEG_ADDRESSES = [
    # Raw EEG channels
    "/muse/eeg",
    # Brainwave bands (absolute)
    "/muse/elements/alpha_absolute",
    "/muse/elements/beta_absolute",
    "/muse/elements/theta_absolute",
    "/muse/elements/delta_absolute",
    "/muse/elements/gamma_absolute",
    # Headband status
    "/muse/elements/horseshoe",
    "/muse/elements/is_good",
    # Blink / jaw clench
    "/muse/elements/blink",
    "/muse/elements/jaw_clench",
    # Accelerometer
    "/muse/acc",
    # Battery
    "/muse/batt",
]


def setup_dispatcher(loop: asyncio.AbstractEventLoop) -> Dispatcher:
    """Map every known OSC address to the broadcast handler."""
    dispatcher = Dispatcher()
    handler = make_osc_handler(loop)
    for addr in EEG_ADDRESSES:
        dispatcher.map(addr, handler)
    # Catch-all for any other OSC messages Mind Monitor sends
    dispatcher.set_default_handler(handler)
    return dispatcher


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

async def main() -> None:
    loop = asyncio.get_running_loop()

    # --- OSC Server ---
    dispatcher = setup_dispatcher(loop)
    osc_server, osc_protocol = await AsyncIOOSCUDPServer(
        (OSC_IP, OSC_PORT), dispatcher, loop
    ).create_serve_endpoint()
    log.info("OSC  listening on udp://%s:%d", OSC_IP, OSC_PORT)

    # --- WebSocket Server ---
    ws_server = await websockets.serve(ws_handler, WS_HOST, WS_PORT)
    log.info("WS   listening on ws://%s:%d", WS_HOST, WS_PORT)

    log.info("")
    log.info("=" * 56)
    log.info("  muse-neurofeedback ready")
    log.info("  1. Open Mind Monitor on your phone")
    log.info("  2. Go to Settings > OSC Stream Host")
    log.info("     -> set to this machine's IP address")
    log.info("  3. OSC Port -> %d", OSC_PORT)
    log.info("  4. Enable OSC streaming")
    log.info("  WebSocket: ws://localhost:%d", WS_PORT)
    log.info("=" * 56)
    log.info("")

    # --- Graceful shutdown on Ctrl-C / SIGTERM ---
    stop_event = asyncio.Event()

    def _request_stop():
        stop_event.set()

    try:
        loop.add_signal_handler(signal.SIGINT, _request_stop)
        loop.add_signal_handler(signal.SIGTERM, _request_stop)
    except NotImplementedError:
        # Windows does not support add_signal_handler
        pass

    await stop_event.wait()

    log.info("Shutting down...")
    osc_server.close()
    ws_server.close()
    await ws_server.wait_closed()
    log.info("Done.")


if __name__ == "__main__":
    asyncio.run(main())
