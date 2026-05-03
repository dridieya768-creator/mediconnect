import { AiService } from './ai.service';
import { AnalyzeSymptomsDto } from './dto/analyze-symptoms.dto';
import { AnalyzeSymptomsResponseDto } from './dto/analyze-symptoms-response.dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    analyzeSymptoms(dto: AnalyzeSymptomsDto): Promise<AnalyzeSymptomsResponseDto>;
}
