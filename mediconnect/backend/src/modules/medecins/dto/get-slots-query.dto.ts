import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetSlotsQueryDto {
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @IsNotEmpty()
  @IsDateString()
  endDate: string;
}
