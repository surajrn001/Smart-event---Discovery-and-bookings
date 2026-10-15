import json
from typing import Dict, List
from fastapi import WebSocket

class LiveSeatsConnectionManager:
    """
    Manages active WebSocket connections for live event seat updates.
    Enables instant broadcasting to all active browser sessions when seats are booked.
    """
    def __init__(self):
        # event_id -> list of active WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, event_id: int, websocket: WebSocket):
        await websocket.accept()
        if event_id not in self.active_connections:
            self.active_connections[event_id] = []
        self.active_connections[event_id].append(websocket)

    def disconnect(self, event_id: int, websocket: WebSocket):
        if event_id in self.active_connections:
            if websocket in self.active_connections[event_id]:
                self.active_connections[event_id].remove(websocket)
            if not self.active_connections[event_id]:
                del self.active_connections[event_id]

    async def broadcast_seat_update(self, event_id: int, available_seats: int, total_seats: int, event_status: str):
        if event_id in self.active_connections:
            message = {
                "type": "SEAT_UPDATE",
                "event_id": event_id,
                "available_seats": available_seats,
                "total_seats": total_seats,
                "event_status": event_status,
                "is_sold_out": available_seats <= 0,
            }
            payload = json.dumps(message)
            dead_connections = []
            for connection in self.active_connections[event_id]:
                try:
                    await connection.send_text(payload)
                except Exception:
                    dead_connections.append(connection)
            for dead in dead_connections:
                self.disconnect(event_id, dead)

seat_manager = LiveSeatsConnectionManager()
