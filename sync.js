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
  try {
    const chunkStr = chunk.toString();
    const json = JSON.parse(chunkStr);
    const hash = chunkStr.hashCode();
    const id = uuidv4();
    const data = {
      ...json,
      id,
      hash,
      timeStr: json.time,
      time: moment(json.time, "DD/MMM/YYYY:HH:mm:ss Z").format(
        "YYYY-MM-DD HH:mm:ss"
      ),
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
    console.log(err.message, err.stack);
    next();
  }
};

stream.prototype._final = () => {
  console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - Sync Finished.");
};

function sync(cb) {
  const jsendStream = new stream();
  console.log(moment().format("YYYY-MM-DD HH:mm:ss") + " - Sync Started.");
  fsr("./nginx.log").pipe(jsendStream);
}

var CronJob = require("cron").CronJob;
var job = new CronJob("* */10 5-22 * * *", sync, null, true, "Asia/Jakarta");
job.start();
