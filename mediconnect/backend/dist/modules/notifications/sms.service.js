"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SmsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmsService = void 0;
const common_1 = require("@nestjs/common");
let SmsService = SmsService_1 = class SmsService {
    constructor() {
        this.logger = new common_1.Logger(SmsService_1.name);
        const sid = process.env.TWILIO_ACCOUNT_SID;
        const token = process.env.TWILIO_AUTH_TOKEN;
        this.from = process.env.TWILIO_PHONE_NUMBER || '';
        this.enabled = !!(sid && token && this.from);
        if (this.enabled) {
            this.client = require('twilio')(sid, token);
            this.logger.log('Twilio SMS service initialized');
        }
        else {
            this.logger.warn('Twilio not configured — SMS disabled (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)');
        }
    }
    async sendSms(to, body) {
        if (!this.enabled) {
            this.logger.debug(`[SMS MOCK] To: ${to} | ${body}`);
            return;
        }
        try {
            await this.client.messages.create({ body, from: this.from, to });
            this.logger.log(`SMS sent to ${to}`);
        }
        catch (err) {
            this.logger.error(`SMS failed to ${to}: ${err.message}`);
        }
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SmsService);
//# sourceMappingURL=sms.service.js.map