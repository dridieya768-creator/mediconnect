import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { StockMouvement } from './stock-mouvement.entity';

export enum StockStatut {
  DISPONIBLE = 'DISPONIBLE',
  RUPTURE = 'RUPTURE',
  PERIME = 'PERIME',
  RAPPEL = 'RAPPEL',
}

@Entity('stock_items')
export class StockItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cip', unique: true })
  cip: string;

  @Column({ name: 'nom' })
  nom: string;

  @Column({ name: 'dci', nullable: true })
  dci: string;

  @Column({ name: 'forme', nullable: true })
  forme: string; // comprimé, sirop, etc.

  @Column({ name: 'dosage', nullable: true })
  dosage: string;

  @Column({ name: 'fournisseur', nullable: true })
  fournisseur: string;

  @Column({ name: 'quantite_totale', type: 'int', default: 0 })
  quantiteTotale: number;

  @Column({ name: 'seuil_alerte', type: 'int', default: 10 })
  seuilAlerte: number;

  @Column({ name: 'prix_achat', type: 'decimal', precision: 10, scale: 3, default: 0 })
  prixAchat: number;

  @Column({ name: 'prix_vente', type: 'decimal', precision: 10, scale: 3, default: 0 })
  prixVente: number;

  @Column({ type: 'enum', enum: StockStatut, default: StockStatut.DISPONIBLE })
  statut: StockStatut;

  // Lots FIFO stockés en JSONB : [{ lot, quantite, dateExpiration, dateReception }]
  @Column({ name: 'lots', type: 'jsonb', default: [] })
  lots: {
    lot: string;
    quantite: number;
    dateExpiration: Date;
    dateReception: Date;
  }[];

  @OneToMany(() => StockMouvement, (m) => m.stockItem)
  mouvements: StockMouvement[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
