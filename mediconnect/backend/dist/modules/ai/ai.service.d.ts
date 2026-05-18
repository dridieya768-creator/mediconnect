import { ConfigService } from '@nestjs/config';
import { ChatMessageDto } from './dto/analyze-symptoms.dto';
export declare const SPECIALITES_VALIDES: readonly ["CARDIOLOGUE", "DERMATOLOGUE", "GYNECOLOGUE", "NEUROLOGUE", "OPHTALMOLOGUE", "ORL", "PEDIATRE", "PSYCHIATRE", "RHUMATOLOGUE", "UROLOGUE", "CHIRURGIEN", "ENDOCRINOLOGUE", "GASTROLOGUE", "NEPHROLOGUE", "ONCOLOGUE", "PNEUMOLOGUE", "MEDECIN_FAMILLE", "URGENTISTE", "ANESTHESISTE", "RADIOLOGUE_SPEC"];
export type Specialite = typeof SPECIALITES_VALIDES[number];
export declare class AiService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    analyzeSymptoms(messages: ChatMessageDto[]): Promise<{
        reply: string;
        specialite: string | null;
        conditions?: any[];
    }>;
    private infermedica;
    private gemini;
    private parseGemini;
    localFallback(messages: ChatMessageDto[]): {
        reply: string;
        specialite: string | null;
    };
    buildGeminiPrompt(messages: ChatMessageDto[]): {};
    parseGeminiResponse(raw: string): {
        reply: string;
        specialite: string;
    };
    getDisclaimer(): string;
}
