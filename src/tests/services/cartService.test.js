// Mock the models
jest.mock('../../models/cart', () => ({
  create: jest.fn(),
  findByPk: jest.fn()
}));

jest.mock('../../models/cartItem', () => ({
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  findByPk: jest.fn()
}));

jest.mock('../../models/product', () => ({
  findByPk: jest.fn()
}));

const CartService = require('../../services/cartService');
const Cart = require('../../models/cart');
const CartItem = require('../../models/cartItem');
const Product = require('../../models/product');


describe('CartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCart', () => {
    it('should create a new cart', async () => {

      // Mock del resultado esperado
      //Arrange
      Cart.create.mockResolvedValue({ id: 1 });
      
      //Act
      const result = await CartService.createCart();
  
      //Assert 
      expect(Cart.create).toHaveBeenCalledTimes(1); // Verificar llamada
      expect(result).toEqual({ id: 1 }); // Verificar resultado
    });
  });

  describe('addItemToCart', () => {
    it('should add a new item to the cart when product exists and has sufficient inventory', async () => {
      // Configurar mocks
      // Arrange
      const mockProduct = {
        id: 1,             // Identificador del producto
        inventory: 10,     // Suficiente inventario disponible
        price: 100         // Precio del producto
      };

      const mockCartItem = {
        cartId: 1,         // Identificador del carrito
        productId: 1,      // Producto que se está añadiendo
        quantity: 2        // Cantidad de este producto en el carrito
      };

      // Act
      Product.findByPk.mockResolvedValue(mockProduct); // Producto válido
      CartItem.findOne.mockResolvedValue(null); // No hay item existente
      CartItem.create.mockResolvedValue(mockCartItem);
  
      const result = await CartService.addItemToCart(1, 1, 2); // cartId, productId, quantity
  
      //Assert
      expect(Product.findByPk).toHaveBeenCalledWith(1); // Verificar llamada al modelo
      expect(CartItem.create).toHaveBeenCalledWith({
        cartId: 1,
        productId: 1,
        quantity: 2
      }); // Verificar creación del item

      // Assert
      expect(result).toEqual(mockCartItem); // Verificar el resultado esperado
    });
  
    it('should throw an error when product inventory is insufficient', async () => {

    // Arrange
    const mockProduct = {
      id: 1,             // Identificador del producto
      inventory: 10,     // Suficiente inventario disponible
      price: 100         // Precio del producto
    };
      // Act
      Product.findByPk.mockResolvedValue({ ...mockProduct, inventory: 1 }); // Insuficiente inventario
      
      // Assert
      await expect(CartService.addItemToCart(1, 1, 2))
        .rejects
        .toThrow('Not enough inventory available'); // Verificar excepción
    });
  });

  describe('getCartItems', () => {
    it('should return cart items with calculated totals', async () => {
      
      // Mock de items y productos
      // Arrange
      CartItem.findAll.mockResolvedValue([
        {           
          quantity: 3,          
          Product: { price: 100,  taxRate: 0.20 }, 
          toJSON: () => ({
            id: 1,
            cartId: 1,
            productId: 1             
          }), // Devuelve los datos del item como un objeto plano
          save: jest.fn().mockResolvedValue(true)
        }
      ]);
      
      //Act
      const result = await CartService.getCartItems(1); // cartId
  
      //Assert
      expect(CartItem.findAll).toHaveBeenCalledWith({ where: { cartId: 1 }, include: Product });

      expect(result).toEqual({
          items:[{
            cartId: 1, 
            id: 1, 
            itemSubtotal: 300, 
            itemTax: 60, 
            productId: 1
          }], 
          summary: {
            subtotal: 300, 
            total: 360, 
            totalTax: 60
          }
    });
    });
  });

  describe('updateCartItem', () => {
    it('should update cart item quantity when sufficient inventory', async () => {
    
      // Arrange
          CartItem.findByPk.mockResolvedValue({
        id: 1, 
        cartId: 1,         // Identificador del carrito
        productId: 1,      // Producto que se está añadiendo
        quantity: 2,        // Cantidad de este producto en el carrito
        Product: { inventory: 10 },
        save: jest.fn().mockResolvedValue(true)
      });
 
      //Act
      const result = await CartService.updateCartItem(1, 2); // itemId, newQuantity
       
      //Assert
      expect(result.quantity).toBe(2); // Verificar actualización
    });
  });

  describe('removeCartItem', () => {
    it('should remove cart item successfully', async () => {

      //Arrange
      const mockCartItemInstance = {
        destroy: jest.fn().mockResolvedValue(true)
      };
      CartItem.findByPk.mockResolvedValue(mockCartItemInstance);
  
      //Act
      await CartService.removeCartItem(1); // itemId
   
      //Assert 
      expect(CartItem.findByPk).toHaveBeenCalledWith(1);
      expect(mockCartItemInstance.destroy).toHaveBeenCalledTimes(1); // Verificar eliminación
    });
  });
});