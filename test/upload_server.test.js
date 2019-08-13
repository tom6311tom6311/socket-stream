import fs from 'fs';
import ws from 'ws';
import IsoRandomStream from 'iso-random-stream';
import { pipeline } from 'stream';
import { expect } from 'chai';
import { SocketStreamServer, SocketStreamClient } from '../index';

const TEST_FILE_PATH = './upload_server_test.txt';
const TEST_FILE_SIZE = 1024 * 1024; // Bytes

describe('#upload_server', () => {
  let sss = null;
  let ssc = null;
  it('server should be able to serve upload task', (done) => {
    sss = new SocketStreamServer({
      port: 7502,
    });
    expect(sss).to.be.an.instanceOf(ws.Server);
    expect(sss.socketStream).to.not.be.undefined;
    sss.on('connection', (cws) => {
      pipeline(
        sss.socketStream(cws),
        fs.createWriteStream(TEST_FILE_PATH),
        (err) => {
          expect(err).to.be.undefined;
          expect(fs.existsSync(TEST_FILE_PATH)).to.equal(true);
          expect(fs.statSync(TEST_FILE_PATH).size).to.equal(TEST_FILE_SIZE);
          done();
        },
      );
    });
    ssc = new SocketStreamClient('http://127.0.0.1:7502/');
    ssc.on('open', () => {
      pipeline(
        IsoRandomStream(TEST_FILE_SIZE),
        ssc.socketStream(),
      );
    });
  });
  after((done) => {
    if (fs.existsSync(TEST_FILE_PATH)) fs.unlinkSync(TEST_FILE_PATH);
    done();
  });
});
