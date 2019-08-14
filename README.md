# socket-stream

*socket-stream* is a npm package for streaming data between clients and servers. To be precise, one can view *socket-stream* as an extension of the [ws](https://www.npmjs.com/package/ws) library with the capability of transmitting large files efficiently via Node.js streams. The `SocketStreamClient` and `SocketStreamServer` classes extend from `ws` and `ws.Server`, respectively, but with additional streaming functionalities.

## Installation
```
npm install socket-stream
```

## API Reference

### Class: SocketStreamClient
- **extends [WebSocket](https://github.com/websockets/ws/blob/HEAD/doc/ws.md#class-websocket)**
- **socketstreamclient.socketStream()**
  - Return a Node.js [Transform](https://nodejs.org/api/stream.html#stream_class_stream_transform) stream instance which is both readable and writable. In uploading cases, this stream reads data from a readable source (such as [fs.createReadStream](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)) and writes data to server through the web socket. In downloading cases, this stream receives data from the web socket and should be piped to a writable destination (such as [fs.createWriteStream](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)).

### Class: SocketStreamServer
- **extends [WebSocket.Server](https://github.com/websockets/ws/blob/HEAD/doc/ws.md#class-websocketserver)**
- **socketstreamserver.socketStream(ws)**
  - `ws`: a [WebSocket](https://github.com/websockets/ws/blob/HEAD/doc/ws.md#class-websocket) instance representing connection from a client-side web socket process.
  - Return a Node.js [Transform](https://nodejs.org/api/stream.html#stream_class_stream_transform) stream instance which is both readable and writable. In uploading cases, this stream reads data from client through the web socket and should be piped to a writable destination (such as [fs.createWriteStream](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options)). In downloading cases, this stream reads data from a readable source (such as [fs.createReadStream](https://nodejs.org/api/fs.html#fs_fs_createreadstream_path_options)) and writes data to client through the web socket.

## Usage Examples

- Upload File
  - Server Side
    ```JavaScript
    const fs = require('fs');
    const { SocketStreamServer } = require('socket-stream');

    // initialize SocketStreamServer
    const sss = new SocketStreamServer({
      port: 7501,
    });

    // when receiving connection from a client, save stream data to `bar.txt`
    sss.on('connection', (cws) => {
      sss.socketStream(cws).pipe(fs.createWriteStream('bar.txt'));
    });
    ```
  - Client Side
    ```JavaScript
    const fs = require('fs');
    const { SocketStreamClient } = require('socket-stream');

    // initialize SocketStreamClient
    const ssc = new SocketStreamClient('http://SERVER_IP:7501/');
    
    // when connection started, send content of `foo.txt` to server
    ssc.on('open', () => {
      fs.createReadStream('foo.txt').pipe(ssc.socketStream());
    });
    ```
- Download File
  - Server Side
    ```JavaScript
    const fs = require('fs');
    const { SocketStreamServer } = require('socket-stream');

    // initialize SocketStreamServer
    const sss = new SocketStreamServer({
      port: 7501,
    });

    // when receiving a `DOWNLOAD` message from a client, send content of `foo.txt` to it
    sss.on('connection', (cws) => {
      cws.on('message', (message) => {
        if (message === 'DOWNLOAD') {
          fs.createReadStream('foo.txt').pipe(sss.socketStream(cws));
        }
      });
    });
    ```
  - Client Side
    ```JavaScript
    const fs = require('fs');
    const { SocketStreamClient } = require('socket-stream');

    // initialize SocketStreamClient
    const ssc = new SocketStreamClient('http://SERVER_IP:7501/');
    
    // when connection started, send downloading prompt and pipe content to `bar.txt`
    ssc.on('open', () => {
      ssc.send('DOWNLOAD');
      ssc.socketStream().pipe(fs.createWriteStream('bar.txt'));
    });
    ```