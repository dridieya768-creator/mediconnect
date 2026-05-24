export declare class SmsService {
    private readonly logger;
    private readonly apiKey;
    private readonly baseUrl;
    private readonly sender;
    private readonly enabled;
    constructor();
    sendSms(to: string, body: string): Promise<void>;
    private normalizePhone;
    private httpPost;
}
