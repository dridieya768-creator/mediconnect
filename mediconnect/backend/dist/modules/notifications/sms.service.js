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
const https = require("https");
let SmsService = SmsService_1 = class SmsService {
    constructor() {
        this.logger = new common_1.Logger(SmsService_1.name);
        this.apiKey = process.env.INFOBIP_API_KEY || '';
        this.baseUrl = process.env.INFOBIP_BASE_URL || '';
        this.sender = process.env.INFOBIP_SENDER || 'MediApp';
        this.enabled = !!(this.apiKey && this.baseUrl);
        if (this.enabled) {
            this.logger.log('Infobip SMS service initialized');
        }
        else {
            this.logger.warn('Infobip not configured — SMS disabled (set INFOBIP_API_KEY, INFOBIP_BASE_URL)');
        }
    }
    async sendSms(to, body) {
        if (!this.enabled) {
            this.logger.debug(`[SMS MOCK] To: ${to} | ${body}`);
            return;
        }
        const normalized = this.normalizePhone(to);
        const payload = JSON.stringify({
            messages: [{
                    from: this.sender,
                    destinations: [{ to: normalized }],
                    text: body,
                }],
        });
        try {
            await this.httpPost(payload);
            this.logger.log(`SMS sent to ${normalized}`);
        }
        catch (err) {
            this.logger.error(`SMS failed to ${normalized}: ${err.message}`);
        }
    }
    normalizePhone(phone) {
        const digits = phone.replace(/\D/g, '');
        if (digits.length === 8)
            return `+216${digits}`;
        if (digits.length === 11 && digits.startsWith('216'))
            return `+${digits}`;
        if (!phone.startsWith('+'))
            return `+${digits}`;
        return phone;
    }
    httpPost(payload) {
        return new Promise((resolve, reject) => {
            const url = new URL(`${this.baseUrl}/sms/2/text/advanced`);
            const options = {
                hostname: url.hostname,
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Authorization': `App ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Content-Length': Buffer.byteLength(payload),
                },
            };
            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
                        resolve();
                    }
                    else {
                        reject(new Error(`Infobip HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });
            req.on('error', reject);
            req.write(payload);
            req.end();
        });
    }
};
exports.SmsService = SmsService;
exports.SmsService = SmsService = SmsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], SmsService);
//# sourceMappingURL=sms.service.js.map