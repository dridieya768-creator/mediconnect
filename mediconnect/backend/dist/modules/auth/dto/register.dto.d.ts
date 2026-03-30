import { UserRole } from '../../users/entities/user.entity';
export declare class DoctorDocumentDto {
    type: string;
    filename: string;
    base64: string;
}
export declare class RegisterDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    documents?: DoctorDocumentDto[];
}
