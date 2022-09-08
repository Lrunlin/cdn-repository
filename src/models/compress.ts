import sharp from "sharp";
import config from "../../config";
async function compress(buffer: Buffer, type: "png" | "jpeg" | "webp" | "gif") {

  return await sharp(buffer, { animated: true })
    [type]({ quality: config.quality })
    .toBuffer();
}
export default compress;
