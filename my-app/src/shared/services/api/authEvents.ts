type EventHandler = () => void;

class SimpleEventEmitter {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  emit(event: string): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler());
    }
  }
}

export const authEvents = new SimpleEventEmitter();

export const AUTH_EVENTS = {
  UNAUTHORIZED: "unauthorized",
  TOKEN_EXPIRED: "token_expired",
} as const;
