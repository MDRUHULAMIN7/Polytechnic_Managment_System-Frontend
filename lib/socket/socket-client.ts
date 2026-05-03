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
  private connectingPromise: Promise<void> | null = null;

  private async fetchSocketToken() {
    const response = await fetch("/api/auth/socket-token", {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: {
        socketToken?: string;
      };
    };

    return payload.data?.socketToken ?? null;
  }

  private async ensureConnected() {
    if (!this.socket || this.socket.connected) {
      return;
    }

    if (this.connectingPromise) {
      await this.connectingPromise;
      return;
    }

    this.connectingPromise = (async () => {
      const socketToken = await this.fetchSocketToken();
      this.socket!.auth = socketToken ? { token: socketToken } : {};

      if (!this.socket!.connected) {
        this.socket!.connect();
      }
    })();

    try {
      await this.connectingPromise;
    } finally {
      this.connectingPromise = null;
    }
  }

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

    void this.ensureConnected();

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
