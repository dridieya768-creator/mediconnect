export declare enum QrCodeType {
    PATIENT = "PATIENT",
    MEDECIN = "MEDECIN",
    ORDONNANCE = "ORDONNANCE",
    ANALYSE = "ANALYSE",
    IMAGERIE = "IMAGERIE",
    TUBE = "TUBE",
    DICOM = "DICOM"
}
export declare enum QrCodeStatus {
    ACTIVE = "ACTIVE",
    USED = "USED",
    EXPIRED = "EXPIRED",
    REVOKED = "REVOKED"
}
export declare class QrCode {
    id: string;
    qrCode: string;
    qrType: QrCodeType;
    entityId: string;
    jwtToken: string;
    status: QrCodeStatus;
    scanCount: number;
    lastScanAt: Date;
    expiresAt: Date;
    createdBy: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
