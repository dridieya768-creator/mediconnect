import { UserRole, UserStatus } from '../modules/users/entities/user.entity';
import { AdminService, CreateUserAdminDto, UpdateUserAdminDto } from './admin.service';
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: UserRole[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        total: number;
        actifs: number;
        medecins: number;
        patients: number;
    }>;
    getUsers(role?: UserRole, status?: UserStatus, search?: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserById(id: string): Promise<any>;
    createUser(dto: CreateUserAdminDto): Promise<any>;
    updateUser(id: string, dto: UpdateUserAdminDto): Promise<any>;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    resetPassword(id: string): Promise<{
        message: string;
    }>;
    getDoctorDocuments(id: string): Promise<any>;
    getAuditLogs(page?: number, limit?: number, role?: string, search?: string): Promise<{
        data: any;
        total: number;
        page: number;
        limit: number;
    }>;
}
