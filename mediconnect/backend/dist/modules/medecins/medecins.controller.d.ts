import { Repository } from "typeorm";
import { User, UserRole } from "../users/entities/user.entity";
export declare class MedecinsController {
    private userRepository;
    constructor(userRepository: Repository<User>);
    getMe(req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
    } | {
        success: boolean;
        data: {
            id: string;
            userId: string;
            firstName: string;
            lastName: string;
            email: string;
            role: UserRole;
            avatarUrl: string;
            specialite: string;
            teleconsultation: boolean;
            ville: string;
        };
        message?: undefined;
    }>;
    getMedecins(search?: string, specialite?: string): Promise<{
        success: boolean;
        data: {
            id: string;
            userId: string;
            firstName: string;
            lastName: string;
            specialite: string;
            ville: string;
            teleconsultation: boolean;
            avatarUrl: string;
        }[];
    }>;
    updateAvailability(req: any, body: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
