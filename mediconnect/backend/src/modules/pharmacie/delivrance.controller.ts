import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { DelivranceService } from './delivrance.service';
import { ScanQrOrdDto } from './dto/scan-qr-ord.dto';
import { ScanMedCipDto } from './dto/scan-med-cip.dto';
import { ConfirmerDelivranceDto } from './dto/confirmer-delivrance.dto';

@Controller('pharmacie')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PHARMACIEN)
export class DelivranceController {
  constructor(private readonly delivranceService: DelivranceService) {}

  @Post('scan-qr-ord')
  scanQrOrd(
    @Body() dto: ScanQrOrdDto,
    @CurrentUser() user: User,
  ) {
    return this.delivranceService.scanQrOrd(dto, user.id);
  }

  @Post('scan-med-cip')
  scanMedCip(
    @Body() dto: ScanMedCipDto,
    @CurrentUser() user: User,
  ) {
    return this.delivranceService.scanMedCip(dto, {});
  }

  @Post('confirmer-delivrance')
  confirmerDelivrance(
    @Body() dto: ConfirmerDelivranceDto,
    @CurrentUser() user: User,
  ) {
    return this.delivranceService.confirmerDelivrance(dto, user.id);
  }
}
