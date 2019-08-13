import fs from 'fs';
import ws from 'ws';
import IsoRandomStream from 'iso-random-stream';
import { pipeline } from 'stream';
import { expect } from 'chai';
import { SocketStreamServer, SocketStreamClient } from '../index';

const TEST_FILE_PATH = './upload_client_test.txt';
const TEST_FILE_SIZE = 1024 * 1024; // Bytes

describe('#upload_client', () => {
  let sss = null;
  let ssc = null;
  before((done) => {
    sss = new SocketStreamServer({
      port: 7501,
    });
    sss.on('connection', (cws) => {
      pipeline(
        sss.socketStream(cws),
        fs.createWriteStream(TEST_FILE_PATH),
      );
    });
    done();
  });
  it('client should be able to upload to server', (done) => {
    ssc = new SocketStreamClient('http://127.0.0.1:7501/');
    expect(ssc).to.be.an.instanceOf(ws);
    expect(ssc.socketStream).to.not.be.undefined;
    ssc.on('open', () => {
      pipeline(
        IsoRandomStream(TEST_FILE_SIZE),
        ssc.socketStream(),
        (err) => {
          expect(err).to.be.undefined;
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
