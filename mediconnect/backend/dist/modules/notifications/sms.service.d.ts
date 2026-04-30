export declare class SmsService {
    private readonly logger;
    private client;
    private readonly from;
    private readonly enabled;
    constructor();
    sendSms(to: string, body: string): Promise<void>;
}
