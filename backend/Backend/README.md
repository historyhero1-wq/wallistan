# Wallistan PHP Backend

## Requirements
- XAMPP (Apache + MySQL + PHP 8+)
- MySQL database

## Setup

1. **Start XAMPP** — Apache aur MySQL dono start karein.

2. **Database install** — Browser mein kholein:
   ```
   http://localhost/w/Backend/install.php
   ```

   Ya terminal se:
   ```bash
   mysql -u root < database/schema.sql
   mysql -u root < database/seed.sql
   ```

3. **API test**:
   - Health: `http://localhost/w/Backend/api/health`
   - Categories: `http://localhost/w/Backend/api/categories`
   - Products: `http://localhost/w/Backend/api/products`

## Admin Panel

URL: `http://localhost/w/Backend/admin/`

**Default login:**
- Email: `admin@wallistan.com`
- Password: `admin123`

### Admin Features
- **Dashboard** — stats, recent orders
- **Categories** — add, edit, delete categories
- **Products** — simple & variable products, images, variations
- **Orders** — view orders, update status, payment notes
- **Coupons** — manage discount codes

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | All categories |
| GET | `/products` | All products |
| GET | `/products/{slug}` | Single product |
| POST | `/orders` | Place order |
| GET | `/orders/{id}?email=` | Order detail |
| POST | `/orders/{id}` | Submit payment proof |
| GET | `/orders/lookup?number=&email=` | Find order |

## Config

Edit `config/database.php` or set environment variables:
- `DB_HOST` (default: 127.0.0.1)
- `DB_NAME` (default: wallistan)
- `DB_USER` (default: root)
- `DB_PASS` (default: empty)

## Frontend

Frontend `STORE_API_URL` se connect hota hai (default: `http://localhost/w/Backend/api`).

Frontend `.env`:
```
STORE_API_URL=http://localhost/w/Backend/api
VITE_STORE_ENABLED=true
```
