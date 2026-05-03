import { Relation } from '../entities/family-member.entity';
export declare class CreateFamilyMemberDto {
    prenom: string;
    nom: string;
    dateNaissance: string;
    relation: Relation;
    sexe: string;
    nss?: string;
    allergies?: string[];
    groupeSanguin?: string;
}
