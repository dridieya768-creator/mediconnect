import { User } from '../../users/entities/user.entity';
export declare class PharmacienProfile {
    id: string;
    userId: string;
    user: User;
    numeroOrdre: string;
    nomPharmacie: string;
    adressePharmacie: string;
    ville: string;
    codePostal: string;
    latitude: number;
    longitude: number;
    horairesOuverture: Record<string, string>;
    isGarde: boolean;
    isOuverte24h: boolean;
    photoUrl: string;
    createdAt: Date;
    updatedAt: Date;
}
