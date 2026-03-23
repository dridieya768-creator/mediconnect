// src/notifications/notifications.controller.ts
import { Controller, Get, Patch, Param, Req, UseGuards } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly svc: NotificationsService) {}

  @Get()
  getMyNotifications(@Req() req: any) {
    return this.svc.findForUser(req.user.id);
  }

  @Get("unread-count")
  getUnreadCount(@Req() req: any) {
    return this.svc.countUnread(req.user.id);
  }

  @Patch("mark-all-read")
  markAllRead(@Req() req: any) {
    return this.svc.markAllRead(req.user.id);
  }

  @Patch(":id/read")
  markOneRead(@Param("id") id: string) {
    return this.svc.markOneRead(id);
  }
}