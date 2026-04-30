export declare enum UserRole {
    PATIENT = "PATIENT",
    MEDECIN = "MEDECIN",
    PHARMACIEN = "PHARMACIEN",
    ADMIN = "ADMIN"
}
export declare enum UserStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    SUSPENDED = "SUSPENDED",
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
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
    tenantId: string;
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
