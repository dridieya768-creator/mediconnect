import { Injectable, Logger } from '@nestjs/common';
import * as https from 'https';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly sender: string;
  private readonly enabled: boolean;

  constructor() {
    this.apiKey  = process.env.INFOBIP_API_KEY  || '';
    this.baseUrl = process.env.INFOBIP_BASE_URL  || '';
    this.sender  = process.env.INFOBIP_SENDER    || 'MediApp';
    this.enabled = !!(this.apiKey && this.baseUrl);

    if (this.enabled) {
      this.logger.log('Infobip SMS service initialized');
    } else {
      this.logger.warn('Infobip not configured — SMS disabled (set INFOBIP_API_KEY, INFOBIP_BASE_URL)');
    }
  }

  async sendSms(to: string, body: string): Promise<void> {
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
    } catch (err: any) {
      this.logger.error(`SMS failed to ${normalized}: ${err.message}`);
    }
  }

  private normalizePhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 8) return `+216${digits}`;
    if (digits.length === 11 && digits.startsWith('216')) return `+${digits}`;
    if (!phone.startsWith('+')) return `+${digits}`;
    return phone;
  }

  private httpPost(payload: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = new URL(`${this.baseUrl}/sms/2/text/advanced`);
      const options = {
        hostname: url.hostname,
        path:     url.pathname,
        method:   'POST',
        headers: {
          'Authorization': `App ${this.apiKey}`,
          'Content-Type':  'application/json',
          'Accept':        'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Infobip HTTP ${res.statusCode}: ${data}`));
          }
        });
      });

      req.on('error', reject);
      req.write(payload);
      req.end();
    });
  }
}
