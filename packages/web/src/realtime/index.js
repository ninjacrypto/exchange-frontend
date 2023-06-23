import WebSocketConnection from './websocket';

class SocketConnection {
  constructor() {
    const socket = new WebSocketConnection();
    
    return socket;
  }
}

export const socket = new SocketConnection();

window.socket = socket;