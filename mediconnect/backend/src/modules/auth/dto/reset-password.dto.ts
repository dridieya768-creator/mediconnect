import { IsString, MinLength, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
  @ApiProperty({ example: "abc123token" })
  @IsString()
  token: string;

  @ApiProperty({ example: "NouveauMotDePasse1!" })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
