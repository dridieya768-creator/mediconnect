import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: any;
  private readonly from: string;
  private readonly enabled: boolean;

  constructor() {
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    this.from   = process.env.TWILIO_PHONE_NUMBER || '';
    this.enabled = !!(sid && token && this.from);

    if (this.enabled) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      this.client = require('twilio')(sid, token);
      this.logger.log('Twilio SMS service initialized');
    } else {
      this.logger.warn('Twilio not configured — SMS disabled (set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER)');
    }
  }

  async sendSms(to: string, body: string): Promise<void> {
    if (!this.enabled) {
      this.logger.debug(`[SMS MOCK] To: ${to} | ${body}`);
      return;
    }
    try {
      await this.client.messages.create({ body, from: this.from, to });
      this.logger.log(`SMS sent to ${to}`);
    } catch (err: any) {
      this.logger.error(`SMS failed to ${to}: ${err.message}`);
    }
  }
}
