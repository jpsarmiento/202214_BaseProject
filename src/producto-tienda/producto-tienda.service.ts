import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from 'src/producto/producto.entity';
import { Repository } from 'typeorm';
import { TiendaEntity } from 'src/tienda/tienda.entity';
import {
    BusinessError,
    BusinessLogicException,
  } from '../shared/errors/business-errors';

@Injectable()
export class ProductoTiendaService {
  constructor(
       @InjectRepository(ProductoEntity)
       private readonly productoRepository: Repository<ProductoEntity>,
   
       @InjectRepository(TiendaEntity)
       private readonly tiendaRepository: Repository<TiendaEntity>
   ) {}


   async addTiendaToProducto(productoId: string, tiendaId: string): Promise<ProductoEntity> {
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
    if (!tienda)
      throw new BusinessLogicException('La tienda con el id suministrado no existe', BusinessError.NOT_FOUND);
  
    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]})
    if (!producto)
      throw new BusinessLogicException('El producto con el id suministrado no existe', BusinessError.NOT_FOUND);

    producto.tiendas = [...producto.tiendas, tienda];
    return await this.productoRepository.save(producto);
  }

async findTiendaByProductoIdTiendaId(productoId: string, tiendaId: string): Promise<TiendaEntity> {
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
    if (!tienda)
      throw new BusinessLogicException('La tienda con el id suministrado no existe', BusinessError.NOT_FOUND)
   
    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["products"]});
    if (!producto)
      throw new BusinessLogicException('El producto con el id suministrado no existe', BusinessError.NOT_FOUND)

    const tiendaProducto: TiendaEntity = producto.tiendas.find(e => e.id === tienda.id);

    if (!tiendaProducto)
      throw new BusinessLogicException('La tienda con el id suministrado no esta asociada al producto', BusinessError.PRECONDITION_FAILED)

    return tiendaProducto;
}

async findTiendasByProductoId(productoId: string): Promise<TiendaEntity[]> {
    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]});
    if (!producto)
      throw new BusinessLogicException('El producto con el id suministrado no existe', BusinessError.NOT_FOUND)
   
    return producto.tiendas;
}

async associateTiendasProducto(productoId: string, tiendas: TiendaEntity[]): Promise<ProductoEntity> {
    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]});
    if (!producto)
      throw new BusinessLogicException('El producto con el id suministrado no existe', BusinessError.NOT_FOUND)

    for (let i = 0; i < tiendas.length; i++) {
      const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendas[i].id}});
      if (!tienda)
        throw new BusinessLogicException("La tienda con el id suministrado no existe", BusinessError.NOT_FOUND)
    }
    producto.tiendas = tiendas;
    return await this.productoRepository.save(producto);
}

async deleteTiendaCulture(productoId: string, tiendaId: string){
    const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
    if (!tienda)
      throw new BusinessLogicException("La tienda con el id suministrado no existe", BusinessError.NOT_FOUND)

    const producto: ProductoEntity = await this.productoRepository.findOne({where: {id: productoId}, relations: ["tiendas"]});
    if (!producto)
      throw new BusinessLogicException('El producto con el id suministrado no existe', BusinessError.NOT_FOUND)

    const tiendaProducto: TiendaEntity = producto.tiendas.find(e => e.id === tienda.id);

    if (!tiendaProducto)
        throw new BusinessLogicException('La tienda con el id suministrado no esta asociada al producto', BusinessError.PRECONDITION_FAILED)

    producto.tiendas = producto.tiendas.filter(e => e.id !== tiendaId);
    await this.productoRepository.save(producto);
}  
}
