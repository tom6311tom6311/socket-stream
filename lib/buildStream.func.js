import buildChannel from './buildChannel.func';

const END_TOKEN = '$$$END^^^';

const buildStream = (ws) => {
  const wsCopy = ws;
  const channel = buildChannel((chunk, enc, next) => {
    if (wsCopy.readyState !== wsCopy.OPEN) {
      next();
      return;
    }
    wsCopy.send(typeof chunk === 'string' ? Buffer.from(chunk, 'utf8') : chunk, next);
  }, (done) => {
    done();
    wsCopy.send(JSON.stringify({ token: END_TOKEN }));
  });

  const destroyChannel = () => {
    channel.end();
    channel.destroy();
  };

  wsCopy.onclose = destroyChannel;
  wsCopy.onerror = (err) => {
    channel.destroy(err);
  };
  wsCopy.onmessage = (event) => {
    let { data } = event;
    if (typeof data === 'string' && JSON.parse(data).token === END_TOKEN) destroyChannel();
    else if (data instanceof ArrayBuffer) {
      data = Buffer.from(data);
      channel.push(data);
    } else if (data instanceof Buffer) {
      data = Buffer.from(data, 'utf8');
      channel.push(data);
    }
  };
  return channel;
};

export default buildStream;
