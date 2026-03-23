import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserRole, UserStatus } from '../modules/users/entities/user.entity';
export interface GetUsersQuery {
    role?: UserRole;
    status?: UserStatus;
    search?: string;
    page?: number;
    limit?: number;
}
export interface CreateUserAdminDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    status?: UserStatus;
    phone?: string;
}
export interface UpdateUserAdminDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: UserRole;
    status?: UserStatus;
    phone?: string;
}
export declare class AdminService {
    private userRepository;
    private configService;
    constructor(userRepository: Repository<User>, configService: ConfigService);
    getUsers(query: GetUsersQuery): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }>;
    getUserById(id: string): Promise<any>;
    createUser(dto: CreateUserAdminDto): Promise<any>;
    updateUser(id: string, dto: UpdateUserAdminDto): Promise<any>;
    private sendDoctorStatusEmail;
    deleteUser(id: string): Promise<{
        message: string;
    }>;
    resetPassword(id: string): Promise<{
        message: string;
    }>;
    getDoctorDocuments(userId: string): Promise<any>;
    getStats(): Promise<{
        total: number;
        actifs: number;
        medecins: number;
        patients: number;
    }>;
    private sanitize;
}
