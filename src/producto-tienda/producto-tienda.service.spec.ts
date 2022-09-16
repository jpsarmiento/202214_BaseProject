import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoTiendaService } from './producto-tienda.service';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { faker } from '@faker-js/faker';

describe('ProductoTiendaService', () => {
  let service: ProductoTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let producto: ProductoEntity;
  let tiendasList : TiendaEntity[];

  const seedDatabase = async () => {
    tiendaRepository.clear();
    productoRepository.clear();
 
    tiendasList = [];
    for(let i = 0; i < 5; i++){
      const tienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.datatype.string(3),
      direccion: faker.address.street()})
      tiendasList.push(tienda);
  }

    producto = await productoRepository.save({
    nombre: faker.company.name(),
    precio: faker.datatype.number({min: 0, max: 100}),
    tipo: "Perecedero",
    tiendas: tiendasList});
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoTiendaService],
    }).compile();

    service = module.get<ProductoTiendaService>(ProductoTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    tiendaRepository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addTiendaProducto should add a tienda to a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
        nombre: 'Tienda X',
        ciudad: 'abc',
        direccion: 'Direccion X'
    });

    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: 'Producto X',
      precio: 10,
      tipo: 'Perecedero'
    })

    const result: ProductoEntity = await service.addTiendaToProducto(newProducto.id, newTienda.id);
   expect(result.tiendas.length).toBe(1);
   expect(result.tiendas[0]).not.toBeNull();
   expect(result.tiendas[0].nombre).toBe(newTienda.nombre)
   expect(result.tiendas[0].ciudad).toBe(newTienda.ciudad)
   expect(result.tiendas[0].direccion).toBe(newTienda.direccion)
  });

  it('addTiendaProducto should thrown exception for an invalid tienda', async () => {
    const newProducto: ProductoEntity = await productoRepository.save({
      nombre: 'Producto X',
      precio: 10,
      tipo: 'Perecedero'
    })
 
    await expect(() => service.addTiendaToProducto(newProducto.id, "0")).rejects.toHaveProperty("message", 'La tienda con el id suministrado no existe');
  });

  it('addTiendaProducto should throw an exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: 'Tienda X',
      ciudad: 'abc',
      direccion: 'Direccion X'
  });
 
    await expect(() => service.addTiendaToProducto("0", newTienda.id)).rejects.toHaveProperty("message", 'El producto con el id suministrado no existe');
  });

  it('findTiendaByProductoIdTiendaId should return tienda by producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    const storedTienda: TiendaEntity = await service.findTiendaByProductoIdTiendaId(producto.id, tienda.id, )
    expect(storedTienda).not.toBeNull();
    expect(storedTienda.nombre).toBe(tienda.nombre);
    expect(storedTienda.ciudad).toBe(tienda.ciudad);
    expect(storedTienda.direccion).toBe(tienda.direccion);
  });

  it('findTiendaByProductoIdTiendaId should throw an exception for an invalid tienda', async () => {
    await expect(()=> service.findTiendaByProductoIdTiendaId(producto.id, "0")).rejects.toHaveProperty("message", 'La tienda con el id suministrado no existe');
  });

  it('findTiendaByProductoIdTiendaId should throw an exception for an invalid producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.findTiendaByProductoIdTiendaId("0", tienda.id)).rejects.toHaveProperty("message", 'El producto con el id suministrado no existe');
  });

  it('findTiendaByProductoIdTiendaId should throw an exception for a tienda not associated to a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: 'Tienda X',
      ciudad: 'abc',
      direccion: 'Direccion X'
    });
 
    await expect(()=> service.findTiendaByProductoIdTiendaId(producto.id, newTienda.id)).rejects.toHaveProperty("message", 'La tienda con el id suministrado no esta asociada al producto');
  });

  it('findTiendasByProductoId should return tiendas by producto', async ()=>{
    const tiendas: TiendaEntity[] = await service.findTiendasByProductoId(producto.id);
    expect(tiendas.length).toBe(5)
  });

  it('findTiendasByProductoId should throw an exception for an invalid producto', async () => {
    await expect(()=> service.findTiendasByProductoId("0")).rejects.toHaveProperty("message", 'El producto con el id suministrado no existe');
  });

  it('associateTiendasProducto should update tiendas list for a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: 'Tienda Y',
      ciudad: 'abc',
      direccion: 'Direccion Y'
    });
 
    const updatedProducto: ProductoEntity = await service.associateTiendasProducto(producto.id, [newTienda]);
    expect(updatedProducto.tiendas.length).toBe(1);
    expect(updatedProducto.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(updatedProducto.tiendas[0].ciudad).toBe(newTienda.ciudad);
    expect(updatedProducto.tiendas[0].direccion).toBe(newTienda.direccion);
  });

  it('associateTiendasProducto should throw an exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: 'Tienda Y',
      ciudad: 'abc',
      direccion: 'Direccion Y'
    });
 
    await expect(()=> service.associateTiendasProducto("0", [newTienda])).rejects.toHaveProperty("message", 'El producto con el id suministrado no existe');
  });

  it('associateTiendasProducto should throw an exception for an invalid tienda', async () => {
    const newTienda: TiendaEntity = tiendasList[0];
    newTienda.id = "0";
 
    await expect(()=> service.associateTiendasProducto(producto.id, [newTienda])).rejects.toHaveProperty("message", 'La tienda con el id suministrado no existe');
  });

  it('deleteTiendaToProducto should remove a tienda from a producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
   
    await service.deleteTiendaCulture(producto.id, tienda.id);
 
    const storedProducto: ProductoEntity = await productoRepository.findOne({where: {id: producto.id}, relations: ["tiendas"]});
    const deletedTienda: TiendaEntity = storedProducto.tiendas.find(a => a.id === tienda.id);
 
    expect(deletedTienda).toBeUndefined();
  });

  it('deleteTiendaToProducto should thrown an exception for an invalid tienda', async () => {
    await expect(()=> service.deleteTiendaCulture(producto.id, "0")).rejects.toHaveProperty("message", 'La tienda con el id suministrado no existe');
  });

  it('deleteTiendaToProducto should thrown an exception for an invalid producto', async () => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(()=> service.deleteTiendaCulture("0", tienda.id)).rejects.toHaveProperty("message", 'El producto con el id suministrado no existe');
  });

  it('deleteTiendaToProducto should thrown an exception for a non asocciated tienda', async () => {
    const newTienda:TiendaEntity = await tiendaRepository.save({
      nombre: 'Tienda Y',
      ciudad: 'abc',
      direccion: 'Direccion Y'
    });
 
    await expect(()=> service.deleteTiendaCulture(producto.id, newTienda.id)).rejects.toHaveProperty("message", 'La tienda con el id suministrado no esta asociada al producto');
  });
});
