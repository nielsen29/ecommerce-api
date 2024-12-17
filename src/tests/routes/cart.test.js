const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { initTestDb, closeTestDb } = require('../setup/testDb');
const cartRouter = require('../../routes/cart');
const Cart = require('../../models/cart');
const Product = require('../../models/product');
const Category = require('../../models/category');
const CartItems = require('../../models/cartItem');


const app = express();
app.use(bodyParser.json());
app.use('/api/carts', cartRouter);


let userId = 45;
let carrito, categoria, producto, items;

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

    categoria = await Category.create({
      name: "Perro Categoria",
      description: "Diabluuuuuuuu el pegggrroo"
    });

    producto =  await Product.create({
      name: "Moco de Mono",
      price: 3.60,
      inventory: 3,
      categoryId: categoria.id
    });

    carrito = await Cart.create({userId: userId});
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
    // it('no deberia crear el carrito', async () => {
    //   const cartData = {
    //     userId: null,
    //   }
    //
    //   const response = await request(app)
    //       .post(`/api/carts/${cartData.userId}`)
    //       .expect(400)
    //
    //   //console.log(response.body);
    //   expect(response.body).toHaveProperty('error');
    //
    //   //Base de datos
    //
    //   const cart = await Cart.findByPk(response.body.id);
    //   //console.log(cart)
    //   expect(cart).not.toBeNull();
    // });


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

    it('should add item to cart', async () => {

      const params = {
        productId: producto.id,
        quantity: 3
      };

      const response = await request(app)
          .post(`/api/carts/${carrito.id}/items`)
          .send(params)
          .expect(201);
      console.log(response.body)

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('productId', producto.id);
      expect(response.body).toHaveProperty('quantity', params.quantity);


    });

    // NO EXISTE INVENTARIO
    it('should not add item to cart NO INVENTORY', async () => {

      const params = {
        productId: producto.id,
        quantity: 10
      };

      const response = await request(app)
          .post(`/api/carts/${carrito.id}/items`)
          .send(params)
          .expect(400);
      //console.log(response)

      expect(response.body).toHaveProperty('error', 'Not enough inventory available');

    });

    //NO EXISTE EL ITEM
    it('should not add item to cart NO EXISTE ITEM', async () => {

      const params = {
        productId: 12,//producto.id,
        quantity: 10
      };

      const response = await request(app)
          .post(`/api/carts/${carrito.id}/items`)
          .send(params)
          .expect(400);
      //console.log(response)

      expect(response.body).toHaveProperty('error', 'Product not found');

    });


  });

  describe('GET /api/carts/:cartId/items', () => {

    beforeEach({

    });

    //LISTAR LOS ITEMS
    it('should return cart items with totals', async () => {

      const response = await  request(app)
          .get(`/api/carts/${carrito.id}/items`)
          .expect(200)

      console.log("TEST TOTAL ITEMS",response.body)

      expect(response.body).toHaveProperty('items')
      expect(response.body).toHaveProperty('summary')

    });


    // it('should no return cart items with totals', async () => {
    //
    //   const response = await  request(app)
    //       .get(`/api/carts/ww2/items`)
    //       .expect(200)
    //
    //   console.log(response.body)
    //
    //   expect(response.body).toHaveProperty('items')
    //   expect(response.body).toHaveProperty('summary')
    //
    // });
  });


  describe('PUT /cart/:cartId/items/:itemId', () => {

    //ACTUALIZAR CANTIDAD DE LOS ITEMS
    it('should Updates the quantity of an item in the cart', async () => {

      console.log(carrito);
      const items = await CartItems.findAll();

      console.log(items);

      const response = await  request(app)
          .get(`/api/carts/${carrito.id}/items/${items[0].id}`)
          .expect(200);

      expect(response.body).toHaveProperty('items')
      expect(response.body).toHaveProperty('summary')

    });


    // it('should no return cart items with totals', async () => {
    //
    //   const response = await  request(app)
    //       .get(`/api/carts/ww2/items`)
    //       .expect(200)
    //
    //   console.log(response.body)
    //
    //   expect(response.body).toHaveProperty('items')
    //   expect(response.body).toHaveProperty('summary')
    //
    // });
  });


});