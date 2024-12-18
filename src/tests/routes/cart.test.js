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
      taxRate: 0.07,
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

    let cartItems;
    beforeEach(async () => {

      //carrito = carrito
      //console.log("RETURN TOTAL ITEMS",carrito);

      cartItems = await CartItems.create({
        cartId: carrito.id,
        productId: producto.id,
        quantity: 4
      })

    })

    //LISTAR LOS ITEMS
    it('should return cart items with totals', async () => {

      const response = await  request(app)
          .get(`/api/carts/${carrito.id}/items`)
          .expect(200)

      console.log("TEST TOTAL ITEMS",response.body)

      expect(response.body).toHaveProperty('items')
      expect(response.body).toHaveProperty('summary')

      const summary = response.body.summary;
      const tax = (producto.price * cartItems.quantity) * producto.taxRate;

      expect(summary).toHaveProperty('subtotal', producto.price * cartItems.quantity); // 3.6 * 4
      expect(summary).toHaveProperty('totalTax', tax);
      expect(summary).toHaveProperty('total', (producto.price * cartItems.quantity) + tax);

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

    let cartItems;
    beforeEach(async () => {

      //carrito = carrito
      //console.log("RETURN TOTAL ITEMS",carrito);

      cartItems = await CartItems.create({
        cartId: carrito.id,
        productId: producto.id,
        quantity: 4
      })

    });

    //ACTUALIZAR CANTIDAD DE LOS ITEMS
    it('should Updates the quantity of an item in the cart', async () => {

      const quantity = 2;

      const response = await  request(app)
          .put(`/api/carts/${carrito.id}/items/${cartItems.id}`)
          .send({
            quantity: quantity,
          })
          .expect(200);

      expect(response.body).toHaveProperty('id', cartItems.id)
      expect(response.body).toHaveProperty('quantity', quantity);

    });

    it('should not Updates the quantity of an item in the cart', async () => {

      const quantity = 10;

      const response = await  request(app)
          .put(`/api/carts/${carrito.id}/items/${cartItems.id}`)
          .send({
            quantity: quantity,
          })
          .expect(400);
      console.log(response.body);

      expect(response.body).toHaveProperty('error', "Not enough inventory available")

    });

    it('should not Updates the quantity of an item in the cart - Item not found', async () => {

      const quantity = 10;

      const response = await  request(app)
          .put(`/api/carts/${carrito.id}/items/123233`)
          .send({
            quantity: quantity,
          })
          .expect(400);
      console.log(response.body);

      expect(response.body).toHaveProperty('error', "Item not found")

    });

  });

  describe('DELETE /cart/:cartId/items/:itemId', () => {

    let cartItems;

    beforeEach(async () => {

      cartItems = await CartItems.create({
        cartId: carrito.id,
        productId: producto.id,
        quantity: 4
      })

    })

    it('should delete items in the cart', async () => {

      const response = await  request(app)
          .delete(`/api/carts/${carrito.id}/items/${cartItems.id}`)
          .expect(204);

    });


    it('should not delete items in the cart // NOT FOUND', async () => {

      const response = await  request(app)
          .delete(`/api/carts/${carrito.id}/items/67676767`)
          .expect(400);

      expect(response.body).toHaveProperty('error', "Item not found")

    });

  });


});