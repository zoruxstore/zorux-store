const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.neon_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        if (req.method === 'GET') {
            const result = await pool.query('SELECT * FROM products ORDER BY id DESC');
            return res.status(200).json(result.rows);
        }

        if (req.method === 'POST') {
            const { name, price, origPrice, desc, category, images } = req.body;
            const imageUrlsJson = JSON.stringify(images || []);
            
            const result = await pool.query(
                'INSERT INTO products (name, price, orig_price, description, category, images) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [name, price, origPrice, desc, category, imageUrlsJson]
            );
            return res.status(201).json(result.rows[0]);
        }

        if (req.method === 'DELETE') {
            const { id } = req.query;
            await pool.query('DELETE FROM products WHERE id = $1', [id]);
            return res.status(200).json({ message: 'Deleted successfully' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
