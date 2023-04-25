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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var instagram_private_api_1 = require("instagram-private-api");
var zod_1 = require("zod");
var cross_fetch_1 = require("cross-fetch");
var dotenv = require("dotenv");
dotenv.config();
// const NAKED_EXTRA_CRISPY_URL = "https://nakedextracrispy.com";
var NAKED_EXTRA_CRISPY_URL = "http://localhost:3000";
var DATA_URL = "".concat(NAKED_EXTRA_CRISPY_URL, "/api/social/next-post?type=ig-post");
var SEND_EMAIL_URL = "https://send-to-makon.vercel.app/api/send-email";
var IG_USERNAME = process.env.IG_USERNAME;
var IG_PASSWORD = process.env.IG_PASSWORD;
var NAKEDEXTRACRISPY_AUTH_KEY = process.env.NAKEDEXTRACRISPY_AUTH_KEY;
var postDataSchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    caption: zod_1.z.string(),
    images: zod_1.z.object({
        main: zod_1.z.string(),
        drum: zod_1.z.string().nullable(),
        flat: zod_1.z.string().nullable()
    }),
    lat: zod_1.z.number(),
    lng: zod_1.z.number()
});
if (!IG_USERNAME || !IG_PASSWORD || !NAKEDEXTRACRISPY_AUTH_KEY) {
    throw new Error("IG_USERNAME, IG_PASSWORD, NAKEDEXTRACRISPY_AUTH_KEY env vars must be set");
}
var ig = new instagram_private_api_1.IgApiClient();
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var postData, lat, lng, name_1, caption, images, id, imageUrls, photoArrayBuffers, photoBuffers, albumPhotoItems, locations, location_1, result, queryParams, e_1, message, queryParams;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 9, , 10]);
                return [4 /*yield*/, getPostData()];
            case 1:
                postData = _b.sent();
                lat = postData.lat, lng = postData.lng, name_1 = postData.name, caption = postData.caption, images = postData.images, id = postData.id;
                imageUrls = [images.main, images.drum, images.flat].filter(Boolean);
                return [4 /*yield*/, Promise.all(imageUrls.map(function (url) { return (0, cross_fetch_1["default"])(url).then(function (res) { return res.arrayBuffer(); }); }))];
            case 2:
                photoArrayBuffers = _b.sent();
                photoBuffers = photoArrayBuffers.map(function (buffer) { return Buffer.from(buffer); });
                albumPhotoItems = photoBuffers.map(function (buffer) { return ({ file: buffer }); });
                return [4 /*yield*/, loginToInstagram()];
            case 3:
                _b.sent();
                return [4 /*yield*/, ig.search.location(lat, lng, name_1)];
            case 4:
                locations = _b.sent();
                location_1 = locations[0];
                result = void 0;
                if (!(albumPhotoItems.length === 1)) return [3 /*break*/, 6];
                return [4 /*yield*/, ig.publish.photo({
                        file: (_a = albumPhotoItems[0]) === null || _a === void 0 ? void 0 : _a.file,
                        caption: caption,
                        location: location_1
                    })];
            case 5:
                result = _b.sent();
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, ig.publish.album({
                    items: albumPhotoItems,
                    caption: caption,
                    location: location_1
                })];
            case 7:
                result = _b.sent();
                _b.label = 8;
            case 8:
                queryParams = new URLSearchParams();
                queryParams.set("subject", "IG Post Success!");
                queryParams.set("message", "".concat(NAKED_EXTRA_CRISPY_URL, "/wings/").concat(id));
                (0, cross_fetch_1["default"])("".concat(SEND_EMAIL_URL, "?").concat(queryParams));
                console.log(result);
                return [3 /*break*/, 10];
            case 9:
                e_1 = _b.sent();
                message = getErrorMessage(e_1);
                queryParams = new URLSearchParams();
                queryParams.set("subject", "IG Post Error!");
                queryParams.set("message", "".concat(message));
                (0, cross_fetch_1["default"])("".concat(SEND_EMAIL_URL, "?").concat(queryParams));
                console.error(message);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
var loginToInstagram = function () { return __awaiter(void 0, void 0, void 0, function () {
    var e_2, e_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                ig.state.generateDevice(IG_USERNAME);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, ig.simulate.preLoginFlow()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_2 = _a.sent();
                return [3 /*break*/, 4];
            case 4: return [4 /*yield*/, ig.account.login(IG_USERNAME, IG_PASSWORD)];
            case 5:
                _a.sent();
                _a.label = 6;
            case 6:
                _a.trys.push([6, 8, , 9]);
                return [4 /*yield*/, ig.simulate.postLoginFlow()];
            case 7:
                _a.sent();
                return [3 /*break*/, 9];
            case 8:
                e_3 = _a.sent();
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
var getPostData = function () { return __awaiter(void 0, void 0, void 0, function () {
    var data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, cross_fetch_1["default"])(DATA_URL, {
                    method: "GET",
                    headers: {
                        Authorization: "".concat(NAKEDEXTRACRISPY_AUTH_KEY)
                    }
                }).then(function (res) { return res.json(); })];
            case 1:
                data = _a.sent();
                console.log(data);
                return [2 /*return*/, postDataSchema.parse(data)];
        }
    });
}); };
var getErrorMessage = function (error) {
    if (error instanceof Error)
        return error.message;
    return String(error);
};
main();
