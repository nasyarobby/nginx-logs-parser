const db = require("./models");
const { Log } = db;
const fsr = require("fs-reverse");
const uuidv4 = require("uuid").v4;
const moment = require("moment");

Object.defineProperty(String.prototype, "hashCode", {
  value: function () {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < this.length; i++) {
      chr = this.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  },
});

const stream = require("stream").Writable;
stream.prototype._write = function (chunk, enc, next) {
  const chunkStr = chunk.toString();
  if (!chunkStr.trim()) return next();
  try {
    const json = JSON.parse(chunkStr);
    const hash = chunkStr.hashCode();
    const id = uuidv4();
    const data = {
      id,
      hash,
      remoteAddr: json.remoteAddr,
      remoteUser: json.remoteUser,
      timeStr: json.time,
      time: moment(json.time, "DD/MMM/YYYY:HH:mm:ss Z").format(
        "YYYY-MM-DD HH:mm:ss"
      ),
      request: json.request,
      status: json.status,
      httpReferer: json.httpReferer,
      httpXForwardedFor: json.httpXForwardedFor,
      client: json.client,
      clientUsername: json.clientUsername,
      requestBody: json.requestBody,
    };

    Log.findOrCreate({
      where: { hash, timeStr: json.time },
      defaults: data,
    }).then(([instance, created]) => {
      console.log(created ? "Created: " + id : "Skip: " + id);
      if (created) next();
      else {
        console.log("Found existing record. Stopping.");
        console.log(
          moment().format("YYYY-MM-DD HH:mm:ss") + " - Sync Finished."
        );
        this.destroy();
      }
    });
  } catch (err) {
    console.log("==========================");
    console.log(err.message, err.stack);
    console.log();
    console.log(chunkStr);
    console.log("==========================");
    next();
  }
};

stream.prototype._final = () => {
  console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - Sync Finished.");
};

module.exports = function sync(cb) {
  const jsendStream = new stream();
  console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - Sync Started.");
  fsr("./nginx.log").pipe(jsendStream);
};
