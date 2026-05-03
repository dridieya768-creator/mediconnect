import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AiService } from './ai.service';
import { AnalyzeSymptomsDto } from './dto/analyze-symptoms.dto';
import { AnalyzeSymptomsResponseDto } from './dto/analyze-symptoms-response.dto';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-symptoms')
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Analyser les symptômes et recommander une spécialité médicale' })
  async analyzeSymptoms(
    @Body() dto: AnalyzeSymptomsDto,
  ): Promise<AnalyzeSymptomsResponseDto> {
    const { reply, specialite } = await this.aiService.analyzeSymptoms(dto.messages);
    return {
      reply,
      specialite,
      disclaimer: this.aiService.getDisclaimer(),
    };
  }
}
