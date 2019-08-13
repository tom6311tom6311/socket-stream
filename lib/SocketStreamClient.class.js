import WebSocket from 'ws';
import buildStream from './buildStream.func';

class SocketStreamClient extends WebSocket {
  socketStream() {
    return buildStream(this);
  }
}

export default SocketStreamClient;
