/* eslint-disable prettier/prettier */
import { TiendaEntity } from '../tienda/tienda.entity';
import { Column, Entity, JoinTable, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';

@Entity()
export class ProductoEntity {
 @PrimaryGeneratedColumn('uuid')
 id: string;

 @Column()
 nombre: string;
 
 @Column()
 precio: number;
 
 @Column()
 tipo: string;

 @ManyToMany(() => TiendaEntity, tienda => tienda.productos)
 @JoinTable()
 tiendas: TiendaEntity[];
}