const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { initTestDb, closeTestDb } = require('../setup/testDb');
const cartRouter = require('../../routes/cart');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Category = require('../../models/category');


const app = express();
app.use(bodyParser.json());
app.use('/api/carts', cartRouter);


describe('Cart Routes', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await Cart.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  describe('POST /api/carts/:userId', () => {
    it('should create a new cart', async () => {

      const cartData = {
        userId: 45,
      }

      const response = await request(app)
          .post(`/api/carts/${cartData.userId}`)
          .expect(201)

      //console.log(response.body);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', cartData.userId.toString());

      //Base de datos

      const cart = await Cart.findByPk(response.body.id);
      //console.log(cart)
      expect(cart).not.toBeNull();

    });

    //USUARIO NULL
    it('no deberia crear el carrito', async () => {
      const cartData = {
        userId: null,
      }

      const response = await request(app)
          .post(`/api/carts/${cartData.userId}`)
          .expect(400)

      //console.log(response.body);
      expect(response.body).toHaveProperty('error');

      //Base de datos

      const cart = await Cart.findByPk(response.body.id);
      //console.log(cart)
      expect(cart).not.toBeNull();
    });


  });

  describe('POST /api/carts/:cartId/items', () => {
    //let cart, product;

    // beforeEach(async () => {
    //   const category = await Category.create({ name: 'Test Category' });
    //   product = await Product.create({
    //     name: 'Test Product',
    //     price: 100,
    //     inventory: 10,
    //     categoryId: category.id
    //   });
    //   cart = await Cart.create({ userId: '1' });
    // });
    let userId = 45;
    let carrito, categoria, producto;

    beforeEach( async () =>{

      categoria = await Category.create({
        name: "Perro Categoria",
        description: "Diabluuuuuuuu el pegggrroo"
      });

      producto =  await Product.create({
        name: "",
        price: 0.0,
        categoryId: categoria.id
      });

      carrito = await Cart.create({userId: userId});


    });

    it('should add item to cart', async () => {



    });

  });

  describe('GET /api/carts/:cartId/items', () => {
    it('should return cart items with totals', async () => {

    });
  });
});