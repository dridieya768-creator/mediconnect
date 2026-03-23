import { IsString, IsUUID, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class Verify2faDto {
  @ApiProperty({ example: "user-uuid-here" })
  @IsString()
  userId: string;

  @ApiProperty({ example: "123456" })
  @IsString()
  @Length(6, 6)
  code: string;
}
