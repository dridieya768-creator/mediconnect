export declare enum UserRole {
    PATIENT = "PATIENT",
    MEDECIN_GENERALISTE = "MEDECIN_GENERALISTE",
    MEDECIN_SPECIALISTE = "MEDECIN_SPECIALISTE",
    MEDECIN_CHEF_SERVICE = "MEDECIN_CHEF_SERVICE",
    MEDECIN_URGENTISTE = "MEDECIN_URGENTISTE",
    PHARMACIEN_TITULAIRE = "PHARMACIEN_TITULAIRE",
    PHARMACIEN_ADJOINT = "PHARMACIEN_ADJOINT",
    PHARMACIEN_GERANT = "PHARMACIEN_GERANT",
    BIOLOGISTE_RESPONSABLE = "BIOLOGISTE_RESPONSABLE",
    BIOLOGISTE_MEDICAL = "BIOLOGISTE_MEDICAL",
    TECHNICIEN_LABO = "TECHNICIEN_LABO",
    PRELEVEUR = "PRELEVEUR",
    RADIOLOGUE = "RADIOLOGUE",
    MANIPULATEUR_RADIO = "MANIPULATEUR_RADIO",
    TECHNICIEN_IMAGERIE = "TECHNICIEN_IMAGERIE",
    ASSISTANT_MEDICAL = "ASSISTANT_MEDICAL",
    SECRETAIRE_MEDICAL = "SECRETAIRE_MEDICAL",
    ADMIN_SYSTEM = "ADMIN_SYSTEM",
    SUPPORT = "SUPPORT"
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
