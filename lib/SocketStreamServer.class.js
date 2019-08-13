/* eslint-disable class-methods-use-this */
import WebSocket from 'ws';
import buildStream from './buildStream.func';

class SocketStreamServer extends WebSocket.Server {
  socketStream(ws) {
    return buildStream(ws);
  }
}

export default SocketStreamServer;
