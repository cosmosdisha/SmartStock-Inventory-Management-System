import os
import sqlite3
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS

app = Flask(__name__)
# Enable global CORS with a fallback wildcard to completely stop browser blocks during testing
CORS(app, resources={r"/api/*": {"origins": "*"}})

DATABASE_DIR = os.path.join(app.root_path, 'instance')
DATABASE_PATH = os.path.join(DATABASE_DIR, 'inventory.db')

# Ensure the instance directory exists for database storage
if not os.path.exists(DATABASE_DIR):
    os.makedirs(DATABASE_DIR)

def get_db_connection():
    """Establishes a connection to the SQLite database and returns rows as dictionaries."""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the schema tables with strict constraints."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Core Inventory Table (CHECK constraint prevents negative values)
   
    # Core Inventory Table (Upgraded with Lifespan & Supplier attributes)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            category TEXT NOT NULL,
            price REAL NOT NULL CHECK(price >= 0),
            quantity INTEGER NOT NULL CHECK(quantity >= 0),
            supplier TEXT DEFAULT 'General Supplier',
            date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
            shelf_life_days INTEGER DEFAULT 365
        )
    ''')
    
    # Activity Log Table for auditing actions
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            MESSAGE TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize tables on startup
init_db()

# --- API ROUTES ---

@app.route('/api/products', methods=['GET'])
def get_products():
    """Retrieves all products from the inventory table."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM inventory')
    products = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return make_response(jsonify(products), 200)

@app.route('/api/products', methods=['POST'])
def add_product():
    """Inserts a fresh product record into the database table."""
    data = request.get_json() or {}
    name = data.get('name')
    category = data.get('category')
    price = data.get('price')
    quantity = data.get('quantity')
    
    # FIX: Read the exact variable string the frontend form is sending
    supplier = data.get('supplier', 'General Supplier')
    shelf_life = data.get('shelf_life_days', 365)

    if not name or not category or price is None or quantity is None:
        return make_response(jsonify({"error": "All core fields are required."}), 400)

    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO inventory (name, category, price, quantity, supplier, shelf_life_days) 
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (name, category, price, quantity, supplier, shelf_life))
        
        log_msg = f"Added asset: {name} ({quantity} units)."
        cursor.execute('INSERT INTO activity_log (MESSAGE) VALUES (?)', (log_msg,))
        
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        
        return make_response(jsonify({
            "id": new_id, "name": name, "category": category, 
            "price": price, "quantity": quantity, "supplier": supplier,
            "shelf_life_days": shelf_life
        }), 201)

    except sqlite3.IntegrityError as e:
        conn.close()
        return make_response(jsonify({"error": f"Database error: {str(e)}"}), 400)
    
@app.route('/api/products/<int:product_id>/stock', methods=['PATCH'])
def update_stock(product_id):
    """Adjusts the stock quantity up or down while strictly preventing negative drops."""
    data = request.get_json() or {}
    adjustment = data.get('adjustment')  # Can be positive (e.g., 5) or negative (e.g., -3)

    if adjustment is None:
        return make_response(jsonify({"error": "Adjustment value missing."}), 400)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Query existing item state
    cursor.execute('SELECT quantity, name FROM inventory WHERE id = ?', (product_id,))
    product = cursor.fetchone()

    if not product:
        conn.close()
        return make_response(jsonify({"error": "Product not found."}), 404)

    current_quantity = product['quantity']
    product_name = product['name']
    new_quantity = current_quantity + adjustment

    # Server guard validation matching DB constraints
    if new_quantity < 0:
        conn.close()
        return make_response(jsonify({"error": "Operation rejected: Stock cannot drop below 0."}), 400)

    try:
        cursor.execute('UPDATE inventory SET quantity = ? WHERE id = ?', (new_quantity, product_id))
        
        action_type = "Restock" if adjustment > 0 else "Sale/Reduction"
        log_msg = f"Updated '{product_name}' stock by {adjustment} ({action_type}). New total: {new_quantity}."
        cursor.execute('INSERT INTO activity_log (MESSAGE) VALUES (?)', (log_msg,))
        
        conn.commit()
        conn.close()
        return make_response(jsonify({"id": product_id, "quantity": new_quantity}), 200)

    except sqlite3.IntegrityError as e:
        conn.close()
        return make_response(jsonify({"error": f"Database update rejected: {str(e)}"}), 400)

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Retrieves the recent activity history logs."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 30')
    logs = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return make_response(jsonify(logs), 200)

if __name__ == '__main__':
    # Force host to localhost to guarantee cross-origin network compliance
    app.run(host='localhost', port=5001, debug=True)