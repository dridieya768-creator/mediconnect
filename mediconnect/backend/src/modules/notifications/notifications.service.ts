// src/notifications/notifications.service.ts
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Notification, NotificationType } from "./notification.entity";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async create(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
  }): Promise<Notification> {
    const notif = this.repo.create(data);
    return this.repo.save(notif);// ligne cree dan bd
  }

  async findForUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: "DESC" },
      take: 50,
    });
  }

  async countUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { userId, isRead: false } });
  }

  async markAllRead(userId: string) {
    await this.repo.update({ userId, isRead: false }, { isRead: true });
    return { success: true };
  }

  async markOneRead(id: string) {
    await this.repo.update(id, { isRead: true });
    return { success: true };
  }
}