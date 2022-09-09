"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp_1 = __importDefault(require("sharp"));
const text_to_svg_1 = __importDefault(require("text-to-svg"));
const config_1 = __importDefault(require("../../config"));
function waterMark(width, height) {
    return __awaiter(this, void 0, void 0, function* () {
        let textToSVG = text_to_svg_1.default.loadSync("public/font.ttf");
        let svg = textToSVG.getSVG(`@${config_1.default.SITE_NAME}`, {
            fontSize: 14,
            letterSpacing: 0.1,
            attributes: {
                fill: config_1.default.waterMarkColor,
            },
            anchor: "left top",
        });
        return yield (0, sharp_1.default)(Buffer.from(svg))
            .webp()
            .metadata()
            .then((meta) => __awaiter(this, void 0, void 0, function* () {
            if (!meta.width || !meta.height) {
                throw new Error("获取图片水印");
            }
            return yield (0, sharp_1.default)({
                create: {
                    width: meta.width + (width ? (width / 20 > 20 ? 20 : width / 20) : 0),
                    height: meta.height + (height ? (height / 10 > 10 ? 10 : height / 10) : 0),
                    channels: 4,
                    background: {
                        r: 255,
                        g: 255,
                        b: 255,
                        alpha: 0,
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
        }));
    });
}
function setWaterMark(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        let { width, height } = yield (0, sharp_1.default)(buffer).metadata();
        if ((width || 0) < 100 || (height || 0) < 50) {
            return yield (0, sharp_1.default)(buffer, { animated: true }).toBuffer();
        }
        return yield (0, sharp_1.default)(buffer, { animated: true })
            .composite([
            {
                input: yield waterMark(width, height),
                gravity: "southeast",
                blend: "atop",
            },
        ])
            .toBuffer();
    });
}
exports.default = setWaterMark;
