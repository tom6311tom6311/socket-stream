import fs from 'fs';
import ws from 'ws';
import IsoRandomStream from 'iso-random-stream';
import { pipeline } from 'stream';
import { expect } from 'chai';
import { SocketStreamServer, SocketStreamClient } from '../index';

const TEST_FILE_PATH = './download_client_test.txt';
const TEST_FILE_SIZE = 1024 * 1024; // Bytes

describe('#download_client', () => {
  let sss = null;
  let ssc = null;
  before((done) => {
    sss = new SocketStreamServer({
      port: 7503,
    });
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
    done();
  });
  it('client should be able to download from server', (done) => {
    ssc = new SocketStreamClient('http://127.0.0.1:7503/');
    expect(ssc).to.be.an.instanceOf(ws);
    expect(ssc.socketStream).to.not.be.undefined;
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
