import express from "express";
import axios from "axios";
import compress from "./models/compress";
import setWaterwark from "./models/set-waterwark";
import config from "../config";
const app = express();

app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.json());

app.get("/*", async (req, res, next) => {
  let path = req.path;
  let isSetSwaterMark = config.waterMark.some(item => path.includes(`/${item}`));
  let type = path.split(".").slice(-1).join("") as any; //文件类型

  Promise.all(
    config.HOST.map(item =>
      axios
        .get(`${item}${path}`, {
          responseType: "arraybuffer", // 特别注意，需要加上此参数
        })
        .then(response => response.data)
        .catch(() => false)
    )
  )
    .then(async response => {
      if (response[0]) {
        res.type(type);
        res.send(response[0]);
      }
      if (response[1]) {
        res.type(type);
        res.send(
          isSetSwaterMark
            ? await setWaterwark(await compress(response[1], type))
            : await compress(response[1], type)
        );
      }
    })
    .catch(err => {
      res.statusCode = 404;
      res.json({
        mes: `404:  ${path}`,
      });
    });
});

app.listen(8866, () => console.log(`run`));
