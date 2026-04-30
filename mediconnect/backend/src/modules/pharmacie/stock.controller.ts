import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole, User } from '../users/entities/user.entity';
import { StockService } from './stock.service';
import { ReceptionLivraisonDto } from './dto/reception-livraison.dto';
import { RetourFournisseurDto } from './dto/retour-fournisseur.dto';
import { InventaireDto } from './dto/inventaire.dto';

@Controller('pharmacie/stock')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PHARMACIEN)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get()
  getStock() {
    return this.stockService.getStock();
  }

  @Get('dashboard')
  getDashboard() {
    return this.stockService.getDashboard();
  }

  @Get('alertes')
  getAlertes() {
    return this.stockService.getAlertes();
  }

  @Get('mouvements')
  getMouvements(@Query('stockItemId') stockItemId?: string) {
    return this.stockService.getMouvements(stockItemId);
  }

  @Post('reception')
  receptionnerLivraison(
    @Body() dto: ReceptionLivraisonDto,
    @CurrentUser() user: User,
  ) {
    return this.stockService.receptionnerLivraison(dto, user.id);
  }

  @Post('inventaire')
  realiserInventaire(
    @Body() dto: InventaireDto,
    @CurrentUser() user: User,
  ) {
    return this.stockService.realiserInventaire(dto, user.id);
  }

  @Post('retour')
  retourFournisseur(
    @Body() dto: RetourFournisseurDto,
    @CurrentUser() user: User,
  ) {
    return this.stockService.retourFournisseur(dto, user.id);
  }
}
