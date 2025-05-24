const { pool } = require('../db/init');

// Get all products with pagination, sorting, and filtering
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      order = 'desc',
      name
    } = req.query;

    // Validate sortBy parameter
    const allowedSortFields = ['name', 'price', 'created_at'];
    if (!allowedSortFields.includes(sortBy)) {
      return res.status(400).json({ error: 'Invalid sort field' });
    }

    // Validate order parameter
    if (!['asc', 'desc'].includes(order.toLowerCase())) {
      return res.status(400).json({ error: 'Invalid order parameter' });
    }

    // Calculate offset
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build the query
    let query = 'SELECT * FROM products';
    const queryParams = [];

    // Add name filter if provided
    if (name) {
      query += ' WHERE LOWER(name) LIKE LOWER(?)';
      queryParams.push(`%${name}%`);
    }

    // Add sorting
    query += ` ORDER BY ${sortBy} ${order}`;

    // Add pagination
    query += ' LIMIT ? OFFSET ?';
    queryParams.push(parseInt(limit), offset);

    // Execute the query
    const [rows] = await pool.query(query, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM products';
    if (name) {
      countQuery += ' WHERE LOWER(name) LIKE LOWER(?)';
    }
    const [countResult] = await pool.query(countQuery, name ? [`%${name}%`] : []);
    const total = countResult[0].total;

    res.json({
      products: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a single product
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM products WHERE id = ?';
    const [rows] = await pool.query(query, [parseInt(id)]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { name, description, price, inventory, image_url } = req.body;

    // Validate required fields
    if (!name || price === undefined || inventory === undefined) {
      return res.status(400).json({ error: 'Name, price, and inventory are required' });
    }

    // Validate price and inventory
    if (price < 0 || inventory < 0 || !Number.isInteger(inventory)) {
      return res.status(400).json({ error: 'Price and inventory must be non-negative numbers, and inventory must be an integer' });
    }

    // Validate image_url if provided
    if (image_url && !isValidUrl(image_url)) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    // Check for duplicate name
    const [existing] = await pool.query('SELECT id FROM products WHERE name = ?', [name]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Product name must be unique' });
    }

    const query = `
      INSERT INTO products (name, description, price, inventory, image_url)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      name,
      description || null,
      parseFloat(price),
      parseInt(inventory),
      image_url || null
    ];
    const [result] = await pool.query(query, values);
    
    // Get the inserted product
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, inventory, image_url } = req.body;

    // Validate price and inventory if provided
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({ error: 'Price must be a non-negative number' });
    }
    if (inventory !== undefined && (isNaN(inventory) || inventory < 0 || !Number.isInteger(inventory))) {
      return res.status(400).json({ error: 'Inventory must be a non-negative integer' });
    }

    // Validate image_url if provided
    if (image_url && !isValidUrl(image_url)) {
      return res.status(400).json({ error: 'Invalid image URL' });
    }

    // Check for duplicate name if name is being updated
    if (name) {
      const [existing] = await pool.query('SELECT id FROM products WHERE name = ? AND id != ?', [name, parseInt(id)]);
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Product name must be unique' });
      }
    }

    // Build the update query dynamically based on provided fields
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (price !== undefined) {
      updates.push('price = ?');
      values.push(parseFloat(price));
    }
    if (inventory !== undefined) {
      updates.push('inventory = ?');
      values.push(parseInt(inventory));
    }
    if (image_url !== undefined) {
      updates.push('image_url = ?');
      values.push(image_url);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(parseInt(id));

    const query = `
      UPDATE products
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    const [result] = await pool.query(query, values);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Get the updated product
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [parseInt(id)]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'DELETE FROM products WHERE id = ?';
    const [result] = await pool.query(query, [parseInt(id)]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Sell a product
const sellProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      return res.status(400).json({ error: 'Quantity must be a positive integer' });
    }

    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Check current inventory
      const [product] = await connection.query('SELECT inventory FROM products WHERE id = ?', [parseInt(id)]);
      
      if (product.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product[0].inventory < quantity) {
        await connection.rollback();
        return res.status(400).json({ error: 'Not enough inventory available' });
      }

      // Update inventory
      const [result] = await connection.query(
        'UPDATE products SET inventory = inventory - ? WHERE id = ?',
        [parseInt(quantity), parseInt(id)]
      );

      await connection.commit();
      res.json({ message: 'Product sold successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error selling product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to validate URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  sellProduct
}; 