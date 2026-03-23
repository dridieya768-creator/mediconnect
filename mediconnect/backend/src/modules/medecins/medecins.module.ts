import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MedecinsController } from "./medecins.controller";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [MedecinsController],
  providers: [],
  exports: [],
})
export class MedecinsModule {}