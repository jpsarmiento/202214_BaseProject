import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from '../producto/producto.entity';
import { ProductoService } from '../producto/producto.service';
import { ProductoTiendaController } from './producto-tienda.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity])],
 providers: [ProductoService],
 controllers: [ProductoTiendaController],
})
export class ProductoModule {}
