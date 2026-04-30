export interface TicketData {
    delivranceId: string;
    delivreAt: Date;
    patient: {
        nom: string;
        prenom: string;
        nss: string;
    };
    pharmacien: {
        nom: string;
        prenom: string;
    };
    qrOrdCode: string;
    medicaments: {
        cip: string;
        nom: string;
        dosage?: string;
        posologie?: string;
        duree?: string;
        quantiteDelivree: number;
        prixUnitaire: number;
        partCnam: number;
        partPatient: number;
    }[];
    financier: {
        totalCnam: number;
        totalPatient: number;
        totalGeneral: number;
    };
}
export declare class TicketPdfService {
    generateTicket(data: TicketData): Promise<string>;
}
