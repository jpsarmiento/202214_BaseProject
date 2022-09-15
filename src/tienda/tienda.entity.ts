/* eslint-disable prettier/prettier */
import { ProductoEntity } from "../producto/producto.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class TiendaEntity {
   @PrimaryGeneratedColumn("uuid")
   id: string;

   @Column()
   nombre: string;

   @Column()
   ciudad: string;
 
   @Column()
   direccion: string;

   @ManyToMany(() => ProductoEntity, product => product.tiendas)
   productos: ProductoEntity[];
}