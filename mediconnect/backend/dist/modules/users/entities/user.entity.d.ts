export declare enum UserRole {
    PATIENT = "PATIENT",
    MEDECIN = "MEDECIN",
    MEDECIN_GENERALISTE = "MEDECIN_GENERALISTE",
    MEDECIN_SPECIALISTE = "MEDECIN_SPECIALISTE",
    MEDECIN_CHEF_SERVICE = "MEDECIN_CHEF_SERVICE",
    PHARMACIEN = "PHARMACIEN",
    BIOLOGISTE_RESPONSABLE = "BIOLOGISTE_RESPONSABLE",
    BIOLOGISTE_MEDICAL = "BIOLOGISTE_MEDICAL",
    TECHNICIEN_LABO = "TECHNICIEN_LABO",
    RADIOLOGUE = "RADIOLOGUE",
    MANIPULATEUR_RADIO = "MANIPULATEUR_RADIO",
    SECRETAIRE_RADIO = "SECRETAIRE_RADIO",
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
