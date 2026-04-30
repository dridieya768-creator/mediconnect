import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn,
} from 'typeorm';
import { StockItem } from './stock-item.entity';

export enum TypeMouvement {
  RECEPTION = 'RECEPTION',
  DELIVRANCE = 'DELIVRANCE',
  RETOUR_FOURNISSEUR = 'RETOUR_FOURNISSEUR',
  INVENTAIRE_AJUSTEMENT = 'INVENTAIRE_AJUSTEMENT',
  PEREMPTION = 'PEREMPTION',
}

@Entity('stock_mouvements')
export class StockMouvement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => StockItem, (s) => s.mouvements, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stock_item_id' })
  stockItem: StockItem;

  @Column({ name: 'stock_item_id' })
  stockItemId: string;

  @Column({ type: 'enum', enum: TypeMouvement })
  type: TypeMouvement;

  @Column({ name: 'quantite', type: 'int' })
  quantite: number; // positif = entrée, négatif = sortie

  @Column({ name: 'lot', nullable: true })
  lot: string;

  @Column({ name: 'motif', nullable: true })
  motif: string;

  @Column({ name: 'pharmacien_id', nullable: true })
  pharmacienId: string;

  @Column({ name: 'avoir_montant', type: 'decimal', precision: 10, scale: 3, nullable: true })
  avoirMontant: number; // pour retours fournisseurs

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
