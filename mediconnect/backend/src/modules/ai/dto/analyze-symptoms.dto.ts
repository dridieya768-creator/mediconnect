import {
  IsArray,
  IsEnum,
  IsString,
  MaxLength,
  ArrayMaxSize,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ChatRole {
  USER      = 'user',
  ASSISTANT = 'assistant',
}

export class ChatMessageDto {
  @IsEnum(ChatRole)
  role: ChatRole;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;
}

export class AnalyzeSymptomsDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];
}
