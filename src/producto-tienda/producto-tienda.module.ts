import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from '../producto/producto.entity';
import { ProductoService } from '../producto/producto.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductoEntity])],
 providers: [ProductoService],
})
export class ProductoModule {}
