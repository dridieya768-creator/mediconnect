export declare enum UserRole {
    PATIENT = "PATIENT",
    MEDECIN = "MEDECIN",
    MEDECIN_GENERALISTE = "MEDECIN_GENERALISTE",
    MEDECIN_SPECIALISTE = "MEDECIN_SPECIALISTE",
    PHARMACIEN = "PHARMACIEN",
    ADMIN = "ADMIN"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    PENDING_VERIFICATION = "PENDING_VERIFICATION",
    REJECTED = "REJECTED"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    status: UserStatus;
    countryCode: string;
    isEmailVerified: boolean;
    mfaEnabled: boolean;
    mfaSecret: string;
    refreshToken: string;
    lastLoginAt: Date;
    avatarUrl: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
}
