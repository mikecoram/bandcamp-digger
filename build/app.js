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
const fs_1 = require("fs");
const source_1 = __importDefault(require("got/dist/source"));
const node_html_parser_1 = __importDefault(require("node-html-parser"));
const pug_1 = __importDefault(require("pug"));
const bandcampDomain = 'bandcamp.com';
function ensureDirectoryExists(path) {
    if (!(0, fs_1.existsSync)(path)) {
        (0, fs_1.mkdirSync)(path, { recursive: true });
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const artistOrLabelName = process.argv[2];
        const subdomain = artistOrLabelName;
        const cachePath = `./cache/${artistOrLabelName}.html`;
        ensureDirectoryExists('cache');
        if (!(0, fs_1.existsSync)(cachePath)) {
            (0, fs_1.writeFileSync)(cachePath, (yield (0, source_1.default)(`https://${subdomain}.${bandcampDomain}/music`)).body);
        }
        const page = (0, node_html_parser_1.default)((0, fs_1.readFileSync)(cachePath).toString());
        const releases = page
            .querySelectorAll('[data-item-id]')
            .map(r => {
            var _a, _b, _c, _d, _e, _f;
            return ({
                id: (_b = (_a = r.getAttribute('data-item-id')) === null || _a === void 0 ? void 0 : _a.split('-')[1]) !== null && _b !== void 0 ? _b : '',
                type: (_d = (_c = r.getAttribute('data-item-id')) === null || _c === void 0 ? void 0 : _c.split('-')[0]) !== null && _d !== void 0 ? _d : '',
                href: `https://${subdomain}.${bandcampDomain}${(_f = (_e = r.querySelector('a')) === null || _e === void 0 ? void 0 : _e.getAttribute('href')) !== null && _f !== void 0 ? _f : ''}`
            });
        });
        ensureDirectoryExists('out');
        (0, fs_1.writeFileSync)(`out/${artistOrLabelName}.html`, pug_1.default.renderFile('templates/page.pug', { releases, artistOrLabel: { title: artistOrLabelName } }));
        console.log(`out/${artistOrLabelName}.html`);
    });
}
main().catch(err => {
    console.error(err);
    process.exit(1);
});
