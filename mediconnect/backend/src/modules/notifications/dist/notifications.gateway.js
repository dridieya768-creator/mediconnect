"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
        while (_) try {
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
exports.NotificationsGateway = void 0;
var websockets_1 = require("@nestjs/websockets");
var NotificationsGateway = /** @class */ (function () {
    function NotificationsGateway(jwtService, configService) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.userSockets = new Map();
    }
    /// 
    NotificationsGateway.prototype.handleConnection = function (client) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var token, payload;
            return __generator(this, function (_d) {
                try {
                    token = ((_a = client.handshake.auth) === null || _a === void 0 ? void 0 : _a.token) || ((_c = (_b = client.handshake.headers) === null || _b === void 0 ? void 0 : _b.authorization) === null || _c === void 0 ? void 0 : _c.replace('Bearer ', ''));
                    if (!token) {
                        client.disconnect();
                        return [2 /*return*/];
                    }
                    payload = this.jwtService.verify(token, {
                        secret: this.configService.get('JWT_SECRET')
                    });
                    client.data.userId = payload.sub;
                    client.data.role = payload.role;
                    client.join("user:" + payload.sub);
                    client.join("role:" + payload.role);
                    if (!this.userSockets.has(payload.sub)) {
                        this.userSockets.set(payload.sub, new Set());
                    }
                    this.userSockets.get(payload.sub).add(client.id);
                    console.log("[WS] Connect\u00E9: " + payload.sub + " (" + payload.role + ") \u2014 socket " + client.id);
                }
                catch (_e) {
                    client.disconnect();
                }
                return [2 /*return*/];
            });
        });
    };
    /// cette fonction est appele quand le client se deconnecte du serveur de websocket
    NotificationsGateway.prototype.handleDisconnect = function (client) {
        var _a;
        var userId = (_a = client.data) === null || _a === void 0 ? void 0 : _a.userId;
        if (userId && this.userSockets.has(userId)) {
            this.userSockets.get(userId)["delete"](client.id);
            if (this.userSockets.get(userId).size === 0) {
                this.userSockets["delete"](userId);
            }
        }
        console.log("[WS] D\u00E9connect\u00E9: socket " + client.id);
    };
    NotificationsGateway.prototype.sendToUser = function (userId, event, data) {
        this.server.to("user:" + userId).emit(event, data);
    };
    NotificationsGateway.prototype.sendToAdmins = function (event, data) {
        this.server.to('role:ADMIN').emit(event, data);
    };
    NotificationsGateway.prototype.handlePing = function (client) {
        client.emit('pong', { time: Date.now() });
    };
    __decorate([
        websockets_1.WebSocketServer()
    ], NotificationsGateway.prototype, "server");
    __decorate([
        websockets_1.SubscribeMessage('ping')
    ], NotificationsGateway.prototype, "handlePing");
    NotificationsGateway = __decorate([
        websockets_1.WebSocketGateway({
            cors: {
                origin: ['http://localhost:4200', 'http://localhost:3001'],
                credentials: true
            },
            namespace: '/notifications'
        })
    ], NotificationsGateway);
    return NotificationsGateway;
}());
exports.NotificationsGateway = NotificationsGateway;
