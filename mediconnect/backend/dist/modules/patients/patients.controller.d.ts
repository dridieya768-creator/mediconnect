import { Repository } from "typeorm";
import { User } from "../users/entities/user.entity";
import { Patient } from "./entities/patient.entity";
export declare class PatientsController {
    private readonly userRepo;
    private readonly patientRepo;
    constructor(userRepo: Repository<User>, patientRepo: Repository<Patient>);
    getMe(req: any): Promise<{
        success: boolean;
        data: any;
        message: string;
        id?: undefined;
    } | {
        success: boolean;
        id: string;
        data: {
            id: string;
            userId: string;
            firstName: string;
            lastName: string;
            email: string;
            role: import("../users/entities/user.entity").UserRole;
            avatarUrl: string;
        };
        message?: undefined;
    }>;
}
