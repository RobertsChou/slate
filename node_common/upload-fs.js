import * as LibraryManager from "~/node_common/managers/library";
import * as Utilities from "~/node_common/utilities";
import * as Constants from "~/node_common/constants";

import B from "busboy";
import FS from "fs";
import path from "path";
import Throttle from "~/node_common/vendor/throttle";

import { v4 as uuid } from "uuid";

const HIGH_WATER_MARK = 1024 * 1024 * 3;

export const formMultipart = (req, res, { user }) =>
  new Promise(async (resolve, reject) => {
    let form = new B({
      headers: req.headers,
      highWaterMark: HIGH_WATER_MARK,
    });

    let target = null;
    let tempPath = null;

    form.on("file", function(fieldname, file, filename, encoding, mime) {
      target = {
        type: mime,
        name: filename,
      };

      // TODO(jim):
      // Construct a stream instead.
      tempPath = path.join(
        Constants.FILE_STORAGE_URL,
        path.basename(`TEMPORARY-${uuid()}`)
      );
      let outStream = FS.createWriteStream(tempPath);
      return file.pipe(outStream);
    });

    form.on("error", async (e) => {
      await FS.unlinkSync(tempPath);
      return reject({
        decorator: "SERVER_UPLOAD_PARSE_FAILURE",
        error: true,
        message: e,
      });
    });

    form.on("finish", async () => {
      return resolve({ decorator: "SERVER_UPLOAD_FAKED", error: true });
    });

    return req
      .pipe(new Throttle({ bytes: HIGH_WATER_MARK, interval: 250 }))
      .pipe(form);
  });
