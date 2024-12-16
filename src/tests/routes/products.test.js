const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { initTestDb, closeTestDb } = require('../setup/testDb');
const productRouter = require('../../routes/products');
const Product = require('../../models/product');
const Category = require('../../models/category');

const app = express();
app.use(bodyParser.json());
app.use('/api/products', productRouter);

describe('Product Routes', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  // Seccion de Pruebas de Creacion de Productos
  describe('POST /api/products', () => {
    
    it('should create a new product', async () => {

      //Arrange
      // Crea la categoría en base de datos temporal
      const category = await Category.create({  
        id: 1,      
        name: "Smartphone"
      });         

      //Act
      // se simula la consulta http al endpoint de creacion de productos
      const response = await request(app)
      .post('/api/products')
      .send({
        name: "Smartphone",
        price: 599.99,
        categoryId: category.id,
        inventory: 0
        });
      
        //Assert
        // se valida el mensaje del estatus y cuerpo de la respuesta
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: 1,
        name: "Smartphone",
        price: 599.99        
      });
         

    });

    it('should return error when category does not exist', async () => {

      //Arrange
      // Crea la categoría en base de datos temporal
      const category = 9999; 

      //Act
      // se simula la consulta http al endpoint de creacion de productos
      const response = await request(app)
        .post('/api/products')
        .send({
          name: 'Smartphone',
          price: 100,
          categoryId: category // ID de categoría inexistente
        });

      //Assert  
      // se valida el mensaje del estatus y cuerpo de la respuesta
      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({ error: 'Category with id 9999 does not exist' });
    
    });

    it('should not create a product with a negative price', async () => {

       //Arrange
      // Se coloca un codigo de categoria no existente
      const category = await Category.create({ name: 'Test Category' });
    
      //Act
      // se simula la consulta http al endpoint de creacion de productos
      const response = await request(app)
        .post('/api/products')
        .send({
          name: "Smartphone",
          price: 100,  // Invalid price (negative)
          categoryId: category.id,
          inventory: -1
        });
    
         //Assert  
      // se valida el mensaje del estatus y cuerpo de la respuesta
      expect(response.status).toBe(400);  // Should return an error for validation
      expect(response.body.error).toBe('Validation error: Validation min on inventory failed');
    });
    
 
  });

  // Seccion de Pruebas para Consultas por Categorias
  describe('GET /api/products/category/:categoryId', () => {

    it('should return products for category', async () => {

      //Arrange
      // Crea la categoría en base de datos temporal
      const category = await Category.create({  
        id: 1,      
        name: "Smartphone"
      });  

      // Crea producto 1 en base de datos temporal
      const product1 = await Product.create({
        name: 'Product 1',
        price: 50,
        categoryId: category.id
    });

     // Crea producto 2 en base de datos temporal
    const product2 = await Product.create({
      name: 'Product 2',
      price: 75,
      categoryId: category.id
    });

    //Act
    //Se simula la consulta http al endpoint de Consulta de productos por Categoria
    const response = await request(app).get(`/api/products/category/${category.id}`);

    //Assert
    // se valida el mensaje del estatus y cuerpo de la respuesta
    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Product 1', price: 50 }),
        expect.objectContaining({ name: 'Product 2', price: 75 })
      ])
    );
  });

  it('should return an empty list when no products exist in category', async () => {
    
    //Arrange
    // Crea la categoría en base de datos temporal
    const category = await Category.create({  
      id: 1,      
      name: "Smartphone"
    });  

    //Act
    //Se simula la consulta http al endpoint de Consulta de productos por Categoria
      const response = await request(app).get(`/api/products/category/${category.id}`);

    //Assert
    // se valida el mensaje del estatus y cuerpo de la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    
    });
      
  });

  describe('GET /api/products', () => {

    it('should return all products', async () => {
      
    //Arrange
    // Crea productos en base de datos temporal
      await Product.bulkCreate([
        { name: 'Smartphone', price: 599.99 },
        { name: 'Laptop', price: 800.00 }
      ]);
    
    //Act
      // se simula la consulta http al endpoint de creacion de productos
      const response = await request(app).get('/api/products');
    
       //Assert
    // se valida el mensaje del estatus y cuerpo de la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ name: 'Smartphone', price: 599.99 }),
          expect.objectContaining({ name: 'Laptop', price: 800.00 })
        ])
      );
    });  
 
  });
   
});
