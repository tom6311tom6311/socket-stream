/* eslint-disable no-underscore-dangle */
import { Transform } from 'stream';

const buildChannel = (write, flush) => {
  const channel = new Transform();

  channel._write = write;
  channel._flush = flush;
  channel._writev = (chunks, cb) => {
    const buffers = new Array(chunks.length);
    for (let i = 0; i < chunks.length; i += 1) {
      if (typeof chunks[i].chunk === 'string') {
        buffers[i] = Buffer.from(chunks[i], 'utf8');
      } else {
        buffers[i] = chunks[i].chunk;
      }
    }
    write(Buffer.concat(buffers), 'binary', cb);
  };

  return channel;
};

export default buildChannel;
