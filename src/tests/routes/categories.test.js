const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { initTestDb, closeTestDb } = require('../setup/testDb');
const categoryRouter = require('../../routes/categories');
const Category = require('../../models/category');

const app = express();
app.use(bodyParser.json());
app.use('/api/categories', categoryRouter);

describe('Category Routes', () => {
  beforeAll(async () => {
    await initTestDb();
  });

  afterAll(async () => {
    await closeTestDb();
  });

  beforeEach(async () => {
    await Category.destroy({ where: {} });
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const categoryData = {
        name: 'Electronics'
      };

      const response = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(201);

      expect(response.body).toHaveProperty('name', 'Electronics');
      expect(response.body).toHaveProperty('id');
    });

    it('should not create a new category ', async () => {
      const categoryData = {
        name: 'Electronics',
      }

      const response = await request(app)
          .post('/api/categories')
          .send({})
          .expect(400);
      //console.log(response.body);
      expect(response.body).toHaveProperty('error', 'notNull Violation: Category.name cannot be null');
    });

  });

  describe('GET /api/categories', () => {

    let categorias;

    beforeEach(async () => {
     categorias = await Category.bulkCreate([
        { name: 'Electronics' },
        { name: 'Books' },
        { name: 'Clothing' }
      ]);
    });

    it('should return all categories', async () => {

      const response = await request(app)
          .get('/api/categories')
          .expect(200)

      //console.log(response.body)

      expect(response.body).toHaveLength(3);
      expect(response.body).toEqual(
          expect.arrayContaining([
              expect.objectContaining({name: categorias[0].name}),
              expect.objectContaining({name: categorias[1].name}),
              expect.objectContaining({name: categorias[2].name})
          ])
      );

    });
  });

  describe('GET NO DATA /api/categories', () => {

    it('should return empty categories data', async () => {

      const response = await request(app)
          .get('/api/categories')
          .expect(200)

      //console.log(response.body)

      expect(response.body).toHaveLength(0);


    });
  });
});