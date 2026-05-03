import { ConfigService } from '@nestjs/config';
import { ChatMessageDto } from './dto/analyze-symptoms.dto';
export declare const SPECIALITES_VALIDES: readonly ["CARDIOLOGUE", "DERMATOLOGUE", "GYNECOLOGUE", "NEUROLOGUE", "OPHTALMOLOGUE", "ORL", "PEDIATRE", "PSYCHIATRE", "RHUMATOLOGUE", "UROLOGUE", "CHIRURGIEN", "ENDOCRINOLOGUE", "GASTROLOGUE", "NEPHROLOGUE", "ONCOLOGUE", "PNEUMOLOGUE", "MEDECIN_FAMILLE", "URGENTISTE", "ANESTHESISTE", "RADIOLOGUE_SPEC"];
export type Specialite = typeof SPECIALITES_VALIDES[number];
export declare class AiService {
    private readonly configService;
    private readonly logger;
    constructor(configService: ConfigService);
    analyzeSymptoms(messages: ChatMessageDto[]): Promise<{
        reply: string;
        specialite: string | null;
    }>;
    buildGeminiPrompt(messages: ChatMessageDto[]): object;
    parseGeminiResponse(rawText: string): {
        reply: string;
        specialite: string | null;
    };
    getDisclaimer(): string;
    localFallback(messages: ChatMessageDto[]): {
        reply: string;
        specialite: string | null;
    };
}
