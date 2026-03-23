import { Repository } from "typeorm";
import { Notification, NotificationType } from "./notification.entity";
export declare class NotificationsService {
    private readonly repo;
    constructor(repo: Repository<Notification>);
    create(data: {
        userId: string;
        type: NotificationType;
        title: string;
        message: string;
        relatedId?: string;
    }): Promise<Notification>;
    findForUser(userId: string): Promise<Notification[]>;
    countUnread(userId: string): Promise<number>;
    markAllRead(userId: string): Promise<{
        success: boolean;
    }>;
    markOneRead(id: string): Promise<{
        success: boolean;
    }>;
}
