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

    });
  });

  describe('GET /api/categories', () => {
    // beforeEach(async () => {
    //   await Category.bulkCreate([
    //     { name: 'Electronics' },
    //     { name: 'Books' },
    //     { name: 'Clothing' }
    //   ]);
    // });

    it('should return all categories', async () => {

    });
  });
});