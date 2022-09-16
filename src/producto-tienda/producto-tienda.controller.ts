import { Controller, UseInterceptors, Get, Param, Post, Body, Put, HttpCode, Delete } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { TiendaDto } from 'src/tienda/tienda.dto';
import { TiendaEntity } from 'src/tienda/tienda.entity';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ProductoTiendaService } from './producto-tienda.service';

@Controller('productos')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductoTiendaController {
    constructor(private readonly productoTiendaService: ProductoTiendaService){}

    @Post(':productoId/tiendas/:tiendaId')
    async addTiendaProduct(@Param('productoId') productoId: string, @Param('tiendaId') tiendaId: string){
    return await this.productoTiendaService.addTiendaToProducto(productoId, tiendaId);
    }

    @Get(':productoId/tiendas/:tiendaId')
    async findTiendaByProductoIdTiendaId(@Param('productoId') productoId: string, @Param('tiendaId') tiendaId: string){
    return await this.productoTiendaService.findTiendaByProductoIdTiendaId(productoId, tiendaId);
    }

    @Get(':productoId/tiendas')
    async findProductsByGastronomicCultureId(@Param('productoId') productoId: string){
    return await this.productoTiendaService.findTiendasByProductoId(productoId);
    }

    @Put(':productoId/tiendas')
    async associateTiendasProducto(@Body() tiendasDto: TiendaDto[], @Param('productoId') productoId: string){
    const tiendas = plainToInstance(TiendaEntity, tiendasDto)
    return await this.productoTiendaService.associateTiendasProducto(productoId, tiendas);
    }

    @Delete(':productoId/tiendas/:tiendaId')
    @HttpCode(204)
    async deleteTiendaProducto(@Param('productoId') productoId: string, @Param('tiendaId') tiendaId: string){
    return await this.productoTiendaService.deleteTiendaCulture(productoId, tiendaId);
    }
}
