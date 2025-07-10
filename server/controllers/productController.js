import Product from '../models/Product.js';
import Invoice from '../models/Invoice.js';

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 */
export const getProducts = async (req, res) => {
  try {
    const { search, sort, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    let sortObj = { createdAt: -1 }; // Default sort
    if (sort) {
      const [field, order] = sort.split(':');
      sortObj = { [field]: order === 'desc' ? -1 : 1 };
    }

    // Execute query with pagination
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('createdBy', 'name')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(query)
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               unit:
 *                 type: string
 *                 enum: [hour, day, piece, service]
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, unit } = req.body;

    // Validate required fields
    if (!name || !price || !unit) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: name, price, and unit' 
      });
    }

    // Validate price
    if (price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    // Validate unit
    const validUnits = ['piece', 'hour', 'day', 'month', 'kg', 'meter'];
    if (!validUnits.includes(unit)) {
      return res.status(400).json({ 
        message: `Unit must be one of: ${validUnits.join(', ')}` 
      });
    }

    const product = new Product({
      name,
      description,
      price,
      unit,
      createdBy: req.user._id
    });

    const savedProduct = await product.save();
    const populatedProduct = await Product.findById(savedProduct._id)
      .populate('createdBy', 'name');

    res.status(201).json(populatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Product with this name already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, unit, isActive } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate price if provided
    if (price !== undefined && price < 0) {
      return res.status(400).json({ message: 'Price cannot be negative' });
    }

    // Validate unit if provided
    if (unit) {
      const validUnits = ['piece', 'hour', 'day', 'month', 'kg', 'meter'];
      if (!validUnits.includes(unit)) {
        return res.status(400).json({ 
          message: `Unit must be one of: ${validUnits.join(', ')}` 
        });
      }
    }

    // Update fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (unit) product.unit = unit;
    if (isActive !== undefined) product.isActive = isActive;

    const updatedProduct = await product.save();
    const populatedProduct = await Product.findById(updatedProduct._id)
      .populate('createdBy', 'name');

    res.json(populatedProduct);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Product with this name already exists' });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 */
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if product is used in any active invoices
    const isUsed = await Invoice.exists({
      'items.product': product._id,
      status: { $in: ['draft', 'sent', 'pending'] }
    });

    if (isUsed) {
      return res.status(400).json({ 
        message: 'Cannot delete product as it is used in active invoices' 
      });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
