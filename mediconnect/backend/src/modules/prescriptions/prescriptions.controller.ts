import { Controller, Get, Post, Patch, Param, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthGuard } from "@nestjs/passport";
import { PrescriptionsService } from "./prescriptions.service";

@ApiTags("prescriptions")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("prescriptions")
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @ApiOperation({ summary: "Créer une ordonnance (médecin)" })
  create(@Body() dto: any) {
    return this.prescriptionsService.create(dto);
  }

  @Get("patient/:patientId")
  @ApiOperation({ summary: "Ordonnances d\'un patient" })
  findByPatient(@Param("patientId") patientId: string) {
    return this.prescriptionsService.findByPatient(patientId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Post("scan-pharmacy")
  @ApiOperation({ summary: "Scanner ordonnance en pharmacie" })
  scanAtPharmacy(@Body() body: { qrCode: string; dispensedQuantities: Record<string, number> }) {
    return this.prescriptionsService.scanAtPharmacy(body.qrCode, body.dispensedQuantities);
  }

  @Post(":id/sign")
  @ApiOperation({ summary: "Signer électroniquement une ordonnance" })
  sign(@Param("id") id: string, @Body() body: { signature: string }) {
    return this.prescriptionsService.signPrescription(id, body.signature);
  }
}
