"use client";

import { io, type Socket } from "socket.io-client";
import type { RealtimeConnectionAck, RealtimeNotification } from "@/lib/type/realtime";

type RealtimeSocket = Socket<
  Record<string, never>,
  {
    "realtime:connected": RealtimeConnectionAck;
    "notification:created": RealtimeNotification;
    "class:started": RealtimeNotification;
    "class:completed": RealtimeNotification;
    "class:cancelled": RealtimeNotification;
    "attendance:marked": RealtimeNotification;
  }
>;

export function resolveSocketBaseUrl() {
  const explicit = process.env.NEXT_PUBLIC_SOCKET_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (!apiBase) {
    return "http://localhost:5000";
  }

  return apiBase.replace(/\/api\/v\d+\/?$/, "");
}

class RealtimeSocketClient {
  private socket: RealtimeSocket | null = null;

  connect() {
    if (typeof window === "undefined") {
      return null;
    }

    if (!this.socket) {
      this.socket = io(resolveSocketBaseUrl(), {
        withCredentials: true,
        transports: ["websocket", "polling"],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });
    }

    if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
  }

  getSocket() {
    return this.socket;
  }
}

export const realtimeSocketClient = new RealtimeSocketClient();
