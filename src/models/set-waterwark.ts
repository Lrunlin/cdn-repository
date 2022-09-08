import sharp from "sharp";
import TextToSVG from "text-to-svg";
import config from "../../config";

let textToSVG = TextToSVG.loadSync("江西拙楷2.0.ttf");
let svg = textToSVG.getSVG(`@${config.SITE_NAME}`, {
  fontSize: 14, // 字体大小
  letterSpacing: 0.1,
  attributes: {
    fill: "gray", // 文字颜色
  },
  anchor: "left top",
});

async function waterMark(width: number | undefined, height: number | undefined) {
  return await sharp(Buffer.from(svg))
    .webp()
    .metadata()
    .then(async meta => {
      if (!meta.width || !meta.height) {
        throw new Error("获取图片水印");
      }
      //  console.log(meta.width + (width ? (width / 10 > 60 ? 60 : width / 10) : 0));
      //  console.log(height ? (height / 5 > 30 ? 30 : height / 5) : 0);
      return await sharp({
        create: {
          //扩大一下水印
          width: meta.width + (width ? (width / 20 > 20 ? 20 : width / 20) : 0),
          height: meta.height + (height ? (height / 10 > 10 ? 10 : height / 10) : 0),
          channels: 4,
          background: {
            r: 255,
            g: 255,
            b: 255,
            alpha: 0.0,
          },
        },
      })
        .composite([
          {
            input: Buffer.from(svg),
            gravity: "northwest",
            blend: "lighten",
          },
        ])
        .png({ quality: 100 })
        .toBuffer();
    });
}

async function setWaterMark(buffer: Buffer) {
  let { width, height } = await sharp(buffer).metadata();

  return await sharp(buffer, { animated: true })
    .composite(
      (width || 0) < 100 || (height || 0) < 50
        ? []
        : [
            {
              input: await waterMark(width, height),
              gravity: "southeast",
              blend: "lighten",
            },
          ]
    )
    .toBuffer();
}
export default setWaterMark;
