import {
  Controller, Post, Get, Param, Query, Req, UseGuards, HttpCode
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  
  @Post('checkout/:appointmentId')
  @UseGuards(JwtAuthGuard)
  async createCheckout(
    @Param('appointmentId') appointmentId: string,
    @Req() req: any,
  ) {
    const patientId = req.user?.id ?? req.user?.sub;
    console.log('[PaymentsController] checkout - user:', req.user, 'patientId:', patientId, 'appointmentId:', appointmentId);
    return this.paymentsService.createCheckoutSession(appointmentId, patientId);
  }

  
  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  async verifyPayment(
    @Query('payment_id') paymentId: string,
    @Query('appointmentId') appointmentId: string,
  ) {
    if (paymentId && appointmentId) {
      await this.paymentsService.verifyPayment(paymentId, appointmentId);
    }
    return { verified: true };
  }

  
  @Get('history')
  @UseGuards(JwtAuthGuard)
  async getHistory(@Req() req: any) {
    const patientId = req.user?.sub ?? req.user?.id;
    return this.paymentsService.getPaymentHistory(patientId);
  }
}
