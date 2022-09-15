import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ProductoEntity } from './producto.entity';
import { ProductoService } from './producto.service';
import { faker } from '@faker-js/faker';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: Repository<ProductoEntity>;
  let productosList = []

  const seedDatabase = async () => {
   repository.clear();
   productosList = [];
   for(let i = 0; i < 5; i++){
       const producto: ProductoEntity = await repository.save({
       nombre: faker.company.name(),
       precio: faker.datatype.number({min: 0, max: 100}),
       tipo: "Perecedero"})
       productosList.push(producto);
   }
 }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [...TypeOrmTestingConfig()],
      providers: [ProductoService],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    await seedDatabase();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });


  it('findAll should return all productos', async () => {
    const productos: ProductoEntity[] = await service.findAll();
    expect(productos).not.toBeNull();
    expect(productos).toHaveLength(productosList.length);
  });
  
  it('findOne should return a producto by id', async () => {
    const storedProducto: ProductoEntity =productosList[0];
    const producto: ProductoEntity = await service.findOne(storedProducto.id);
    expect(producto).not.toBeNull();
    expect(producto.nombre).toEqual(storedProducto.nombre)
    expect(producto.precio).toEqual(storedProducto.precio)
    expect(producto.tipo).toEqual(storedProducto.tipo)
  });
  
  it('findOne should throw an exception for an invalid producto', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", 'El producto con el id suministrado no existe')
  });
  
  it('create should return a new producto', async () => {
    const producto: ProductoEntity = {
      id: "",
      nombre: faker.company.name(),
      precio: faker.datatype.number({min: 0, max: 100}),
      tipo: "Perecedero",
      tiendas: null
    }
  
    const newProducto: ProductoEntity = await service.create(producto);
    expect(newProducto).not.toBeNull();
  
    const storedProducto: ProductoEntity = await repository.findOne({where: {id: newProducto.id}})
    expect(storedProducto).not.toBeNull();
    expect(storedProducto.nombre).toEqual(newProducto.nombre)
    expect(storedProducto.precio).toEqual(newProducto.precio)
    expect(storedProducto.tipo).toEqual(newProducto.tipo)
  });

  it('create producto without precondition should return error', async () => {
    const producto: ProductoEntity = {
      id: "",
      nombre: faker.company.name(),
      precio: faker.datatype.number({min: 0, max: 100}),
      tipo: "NULL",
      tiendas: null
    }

    await expect(() => service.create(producto)).rejects.toHaveProperty("message", 'El tipo del producto debe ser Perecedero o No perecedero')
  });
  
  it('update should modify a product', async () => {
    const producto: ProductoEntity = productosList[0];
    producto.nombre = "New name";
    producto.tipo = "No perecedero";
    const updatedProducto: ProductoEntity = await service.update(producto.id, producto);
    expect(updatedProducto).not.toBeNull();
    const storedProducto: ProductoEntity = await repository.findOne({ where: { id: producto.id } })
    expect(storedProducto).not.toBeNull();
    expect(storedProducto.nombre).toEqual(producto.nombre)
    expect(storedProducto.tipo).toEqual(producto.tipo)
  });
  
  it('update should throw an exception for an invalid producto', async () => {
    let producto: ProductoEntity = productosList[0];
    producto = {
      ...producto, nombre: "New name", tipo: "No perecedero"
    }
    await expect(() => service.update("0", producto)).rejects.toHaveProperty("message", 'El producto con el id suministrado no existe')
  });
  
  it('delete should remove a product', async () => {
    const producto: ProductoEntity = productosList[0];
    await service.remove(producto.id);
     const deletedProducto: ProductoEntity = await repository.findOne({ where: { id: producto.id } })
    expect(deletedProducto).toBeNull();
  });
  
  it('delete should throw an exception for an invalid product', async () => {
    const producto: ProductoEntity = productosList[0];
    await service.remove(producto.id);
    await expect(() => service.remove("0")).rejects.toHaveProperty("message", 'El producto con el id suministrado no existe')
  });


});