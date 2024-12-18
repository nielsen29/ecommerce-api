// Mock the models before requiring the service
jest.mock('../../models/product', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    belongsTo: jest.fn()  // Mock the association method
}));

jest.mock('../../models/category', () => ({
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn()
}));

// Importar Sequelize operators
const { Op } = require('sequelize');

// Now require the service after the mocks are set up
const ProductService = require('../../services/productService');
const Product = require('../../models/product');
const Category = require('../../models/category');

describe('ProductService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

//Trae todos los products
    describe('getAllProducts', () => {
        it('should return all products', async () => {
            const mockProducts = [{ id: 1, name: 'Product 1' }, { id: 2, name: 'Product 2' }];
            Product.findAll.mockResolvedValue(mockProducts);

            const result = await ProductService.getAllProducts();

            expect(Product.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(mockProducts);
        });
    });

//Buscar product por ID
    describe('getProductById', () => {
        it('should return a product when product exists', async () => {
            const mockProduct = { id: 1, name: 'Product 1' };
            Product.findByPk.mockResolvedValue(mockProduct);

            const result = await ProductService.getProductById(1);

            expect(Product.findByPk).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockProduct);
        });

        it('should return null when product does not exist', async () => {
            Product.findByPk.mockResolvedValue(null);

            const result = await ProductService.getProductById(99);

            expect(Product.findByPk).toHaveBeenCalledWith(99);
            expect(result).toBeNull();
        });
    });

//Crear product y validar que exista la categoria
    describe('createProduct', () => {
        it('should create a product when category exists', async () => {
            const mockCategory = { id: 1, name: 'Category 1' };
            const mockProduct = { id: 1, name: 'Product 1', categoryId: 1 };
            Category.findByPk.mockResolvedValue(mockCategory);
            Product.create.mockResolvedValue(mockProduct);

            const result = await ProductService.createProduct({ name: 'Product 1', categoryId: 1 });

            expect(Category.findByPk).toHaveBeenCalledWith(1);
            expect(Product.create).toHaveBeenCalledWith({ name: 'Product 1', categoryId: 1 });
            expect(result).toEqual(mockProduct);
        });

        it('should throw an error when category does not exist', async () => {
            Category.findByPk.mockResolvedValue(null);

            await expect(ProductService.createProduct({ name: 'Product 1', categoryId: 99 }))
                .rejects
                .toThrow('Category with id 99 does not exist');

            expect(Category.findByPk).toHaveBeenCalledWith(99);
            expect(Product.create).not.toHaveBeenCalled();
        });
    });

//Filtrar products por una o multiples categorias
    describe('getProductsByCategory', () => {
        it('should return products by category', async () => {
            const mockProducts = [{ id: 1, name: 'Product 1', categoryId: 1 }];
            Product.findAll.mockResolvedValue(mockProducts);

            const result = await ProductService.getProductsByCategory(1, { sort: 'name,ASC', limit: 10 });

            expect(Product.findAll).toHaveBeenCalledWith({
                where: { categoryId: 1 },
                include: Category,
                order: [['name', 'ASC']],
                limit: 10
            });
            expect(result).toEqual(mockProducts);
        });
    });

    describe('getProductsByCategories', () => {
        it('should return products by categories', async () => {
            const mockProducts = [
                { id: 1, name: 'Product 1', categoryId: 1 },
                { id: 2, name: 'Product 2', categoryId: 2 }
            ];
            Product.findAll.mockResolvedValue(mockProducts);

            const result = await ProductService.getProductsByCategories('1,2', { sort: 'name,DESC', limit: 5 });

            expect(Product.findAll).toHaveBeenCalledWith({
                where: { categoryId: { [Op.in]: [1, 2] } },
                include: Category,
                order: [['name', 'DESC']],
                limit: 5
            });
            expect(result).toEqual(mockProducts);
        });

        it('should throw an error when no categories are provided', async () => {
            await expect(ProductService.getProductsByCategories('', {}))
                .rejects
                .toThrow('Categories parameter is required');

            expect(Product.findAll).not.toHaveBeenCalled();
        });
    });

//Actualizar product y validar cambios en categorias
    describe('updateProduct', () => {
        it('should update a product', async () => {
            const mockCategory = { id: 1, name: 'Category 1' };
            const updatedProduct = { id: 1, name: 'Updated Product', categoryId: 1 };

            Category.findByPk.mockResolvedValue(mockCategory);
            Product.update.mockResolvedValue([1]);

            const result = await ProductService.updateProduct(1, updatedProduct);

            expect(Category.findByPk).toHaveBeenCalledWith(1);
            expect(Product.update).toHaveBeenCalledWith(updatedProduct, { where: { id: 1 } });
            expect(result).toEqual([1]);
        });
    });

//Eliminar product
    describe('deleteProduct', () => {
        it('should delete a product', async () => {
            Product.destroy.mockResolvedValue(1);

            const result = await ProductService.deleteProduct(1);

            expect(Product.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(result).toBe(1);
        });
    });
});
