import { Repository, DataSource } from 'typeorm';
import { PharmacienProfile } from './entities/pharmacien-profile.entity';
import { User } from '../users/entities/user.entity';
export declare class PharmaciePublicController {
    private readonly pharmacienRepo;
    private readonly userRepo;
    private readonly dataSource;
    constructor(pharmacienRepo: Repository<PharmacienProfile>, userRepo: Repository<User>, dataSource: DataSource);
    getMyProfile(req: any): Promise<{
        success: boolean;
        data: {
            nomPharmacie?: undefined;
            numeroOrdre?: undefined;
            adressePharmacie?: undefined;
            ville?: undefined;
            codePostal?: undefined;
            latitude?: undefined;
            longitude?: undefined;
            isGarde?: undefined;
            isOuverte24h?: undefined;
            photoUrl?: undefined;
            telephone?: undefined;
        };
    } | {
        success: boolean;
        data: {
            nomPharmacie: string;
            numeroOrdre: string;
            adressePharmacie: string;
            ville: string;
            codePostal: string;
            latitude: number;
            longitude: number;
            isGarde: boolean;
            isOuverte24h: boolean;
            photoUrl: string;
            telephone: any;
        };
    }>;
    updateMyProfile(body: any, req: any): Promise<{
        success: boolean;
        message: string;
    }>;
    getPharmacies(): Promise<{
        success: boolean;
        data: {
            id: string;
            userId: string;
            nomPharmacie: string;
            pharmacien: string;
            email: string;
            adresse: string;
            ville: string;
            telephone: any;
            isGarde: boolean;
            isOuverte24h: boolean;
            photoUrl: string;
            latitude: number;
            longitude: number;
        }[];
    }>;
    sendQrToPharmacy(body: {
        pharmacieUserId: string;
        qrCode: string;
        patientName?: string;
    }, req: any): Promise<{
        success: boolean;
        message: any;
    }>;
    getMyQrRequests(req: any): Promise<{
        success: boolean;
        data: any;
    }>;
}
