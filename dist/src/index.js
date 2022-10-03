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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const compress_1 = __importDefault(require("./models/compress"));
const set_waterwark_1 = __importDefault(require("./models/set-waterwark"));
const config_1 = __importDefault(require("../config"));
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({
    extended: false,
}));
app.use(express_1.default.json());
app.get("/*", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let path = req.path;
    let isSetSwaterMark = config_1.default.waterMark.some(item => path.includes(`/${item}`));
    let type = path.split(".").slice(-1).join("");
    Promise.all(config_1.default.HOST.map(item => axios_1.default
        .get(`${item}${path}`, {
        responseType: "arraybuffer",
    })
        .then(response => response.data)
        .catch(() => false)))
        .then((response) => __awaiter(void 0, void 0, void 0, function* () {
        if (response[0]) {
            res.type(type);
            res.send(response[0]);
        }
        if (response[1]) {
            res.type(type);
            res.send(isSetSwaterMark
                ? yield (0, set_waterwark_1.default)(yield (0, compress_1.default)(response[1], type))
                : yield (0, compress_1.default)(response[1], type));
        }
    }))
        .catch(err => {
        res.statusCode = 404;
        res.json({
            mes: `404:  ${path}`,
        });
    });
}));
app.listen(8866, () => console.log(`run`));
