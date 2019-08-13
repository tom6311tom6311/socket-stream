import fs from 'fs';
import ws from 'ws';
import IsoRandomStream from 'iso-random-stream';
import { pipeline } from 'stream';
import { expect } from 'chai';
import { SocketStreamServer, SocketStreamClient } from '../index';

const TEST_FILE_PATH = './download_server_test.txt';
const TEST_FILE_SIZE = 1024 * 1024; // Bytes

describe('#download_server', () => {
  let sss = null;
  let ssc = null;
  it('server should be able to serve download task', (done) => {
    sss = new SocketStreamServer({
      port: 7504,
    });
    expect(sss).to.be.an.instanceOf(ws.Server);
    expect(sss.socketStream).to.not.be.undefined;
    sss.on('connection', (cws) => {
      cws.on('message', (message) => {
        if (message === 'DOWNLOAD') {
          pipeline(
            IsoRandomStream(TEST_FILE_SIZE),
            sss.socketStream(cws),
          );
        }
      });
    });
    ssc = new SocketStreamClient('http://127.0.0.1:7504/');
    ssc.on('open', () => {
      ssc.send('DOWNLOAD');
      pipeline(
        ssc.socketStream(),
        fs.createWriteStream(TEST_FILE_PATH),
        (err) => {
          expect(err).to.be.undefined;
          expect(fs.existsSync(TEST_FILE_PATH)).to.equal(true);
          expect(fs.statSync(TEST_FILE_PATH).size).to.equal(TEST_FILE_SIZE);
          done();
        },
      );
    });
  });
  after((done) => {
    if (fs.existsSync(TEST_FILE_PATH)) fs.unlinkSync(TEST_FILE_PATH);
    done();
  });
});
