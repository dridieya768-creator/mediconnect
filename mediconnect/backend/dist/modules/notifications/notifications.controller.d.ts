import { NotificationsService } from "./notifications.service";
export declare class NotificationsController {
    private readonly svc;
    constructor(svc: NotificationsService);
    getMyNotifications(req: any): Promise<import("./notification.entity").Notification[]>;
    getUnreadCount(req: any): Promise<number>;
    markAllRead(req: any): Promise<{
        success: boolean;
    }>;
    markOneRead(id: string): Promise<{
        success: boolean;
    }>;
}
