-- Wallistan Sample Data
USE wallistan;

-- Default admin: admin@wallistan.com / admin123
INSERT INTO admins (email, password_hash, name) VALUES
('admin@wallistan.com', '$2y$10$DtpRYm6ryBhPygKT5HHfq.0WrOw4PWp2.U1XmOzOtaVKReHJv6KLC', 'Admin');

INSERT INTO categories (slug, name, tagline, image) VALUES
('3d-signs', '3D Signs', 'Layered wood, metal and acrylic signs with depth and shadow', '/wallistan_logo.png'),
('led-neon', 'LED Neon', 'Custom neon-style LED signs — warm, vibrant, built to last', '/wallistan_logo.png'),
('shop-signage', 'Shop Signage', 'Storefront signs that pull customers in', '/wallistan_logo.png'),
('wall-decor', 'Wall Decor', 'Premium 3D wall art for homes and offices', '/wallistan_logo.png');

INSERT INTO coupons (code, label, percent_off, amount_off, min_subtotal) VALUES
('SIGNORA10', '10% off entire order', 10, NULL, NULL),
('WELCOME5', '5% off first order', 5, NULL, NULL),
('FLAT1000', 'PKR 1,000 off orders above 20,000', NULL, 1000, 20000);

-- Simple product: Acrylic Name Plate
INSERT INTO products (slug, name, tagline, category_id, product_type, base_price, compare_at_price, description, bullets, rating, review_count, stock, featured, on_sale, status)
VALUES (
    'acrylic-name-plate',
    'Acrylic Name Plate',
    'Crystal-clear acrylic with precision-cut lettering',
    (SELECT id FROM categories WHERE slug = '3d-signs'),
    'simple', 4500, 5500,
    'Premium 8mm clear acrylic name plate with UV-printed or vinyl lettering. Perfect for office doors, reception desks, and home entrances. Includes mounting hardware.',
    '["8mm clear acrylic", "UV-resistant print", "Mounting hardware included", "Nationwide shipping"]',
    4.8, 24, 50, 1, 1, 'publish'
);
INSERT INTO product_images (product_id, url, sort_order) VALUES
((SELECT id FROM products WHERE slug = 'acrylic-name-plate'), '/wallistan_logo.png', 0);

INSERT INTO product_reviews (product_id, author, city, rating, review_text) VALUES
((SELECT id FROM products WHERE slug = 'acrylic-name-plate'), 'Ahmed R.', 'Lahore', 5, 'Exactly as shown. Quality is excellent and delivery was fast.'),
((SELECT id FROM products WHERE slug = 'acrylic-name-plate'), 'Sana K.', 'Multan', 5, 'Beautiful finish on the acrylic. Highly recommend Wallistan.');

-- Simple product: LED Shop Sign
INSERT INTO products (slug, name, tagline, category_id, product_type, base_price, description, bullets, rating, review_count, stock, featured, status)
VALUES (
    'led-shop-sign-backlit',
    'LED Backlit Shop Sign',
    'Halo-lit metal letters — visible day and night',
    (SELECT id FROM categories WHERE slug = 'shop-signage'),
    'simple', 18500,
    'Custom backlit shop sign with brushed stainless steel letters and warm-white LED halo. IP65 rated for outdoor use. Includes transformer and installation guide.',
    '["Brushed stainless steel", "Warm white LED halo", "IP65 outdoor rated", "Free design mockup"]',
    4.9, 18, 20, 1, 'publish'
);
INSERT INTO product_images (product_id, url, sort_order) VALUES
((SELECT id FROM products WHERE slug = 'led-shop-sign-backlit'), '/wallistan_logo.png', 0);

-- Variable product: Custom LED Neon Sign
INSERT INTO products (slug, name, tagline, category_id, product_type, base_price, description, bullets, rating, review_count, stock, featured, status)
VALUES (
    'custom-led-neon-sign',
    'Custom LED Neon Sign',
    'Your text, your colours — hand-crafted LED neon',
    (SELECT id FROM categories WHERE slug = 'led-neon'),
    'variable', 12000,
    'Fully custom LED neon sign. Choose your text, size, and colour. Energy-efficient LED flex with acrylic backboard. Perfect for rooms, cafes, salons, and events.',
    '["Custom text & design", "Energy-efficient LED", "Acrylic backboard included", "Dimmer optional"]',
    4.7, 32, 0, 1, 'publish'
);
INSERT INTO product_images (product_id, url, sort_order) VALUES
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), '/wallistan_logo.png', 0);

INSERT INTO product_options (product_id, option_key, label, option_type, required, options_json, sort_order) VALUES
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 'size', 'Size', 'radio', 1,
 '[{"value":"small","label":"Small (18\\")"},{"value":"medium","label":"Medium (24\\")"},{"value":"large","label":"Large (36\\")"}]', 0),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 'color', 'Colour', 'radio', 1,
 '[{"value":"warm-white","label":"Warm White"},{"value":"pink","label":"Pink"},{"value":"blue","label":"Blue"},{"value":"red","label":"Red"}]', 1);

INSERT INTO product_variations (product_id, price, regular_price, attributes, stock_quantity, in_stock) VALUES
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 12000, NULL, '{"size":"small","color":"warm-white"}', 10, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 12000, NULL, '{"size":"small","color":"pink"}', 10, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 12000, NULL, '{"size":"small","color":"blue"}', 8, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 12000, NULL, '{"size":"small","color":"red"}', 8, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 16000, NULL, '{"size":"medium","color":"warm-white"}', 10, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 16000, NULL, '{"size":"medium","color":"pink"}', 10, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 16000, NULL, '{"size":"medium","color":"blue"}', 8, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 16000, NULL, '{"size":"medium","color":"red"}', 8, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 22000, NULL, '{"size":"large","color":"warm-white"}', 5, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 22000, NULL, '{"size":"large","color":"pink"}', 5, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 22000, NULL, '{"size":"large","color":"blue"}', 5, 1),
((SELECT id FROM products WHERE slug = 'custom-led-neon-sign'), 22000, NULL, '{"size":"large","color":"red"}', 5, 1);

-- Simple product: 3D Wood Mandala
INSERT INTO products (slug, name, tagline, category_id, product_type, base_price, description, bullets, rating, review_count, stock, status)
VALUES (
    '3d-wood-mandala-wall-art',
    '3D Wood Mandala Wall Art',
    'Layered walnut mandala — a statement focal point',
    (SELECT id FROM categories WHERE slug = 'wall-decor'),
    'simple', 8900,
    'Hand-crafted layered walnut mandala wall art. Three layers of precision-cut wood create stunning depth and shadow play. Available in natural walnut finish.',
    '["3-layer walnut construction", "Precision CNC cut", "Ready to hang", "60cm diameter"]',
    4.6, 15, 12, 'publish'
);
INSERT INTO product_images (product_id, url, sort_order) VALUES
((SELECT id FROM products WHERE slug = '3d-wood-mandala-wall-art'), '/wallistan_logo.png', 0);

-- Simple product: Office Reception Sign
INSERT INTO products (slug, name, tagline, category_id, product_type, base_price, compare_at_price, description, bullets, rating, review_count, stock, on_sale, status)
VALUES (
    'office-reception-3d-sign',
    'Office Reception 3D Sign',
    'Brushed metal + acrylic — premium corporate look',
    (SELECT id FROM categories WHERE slug = '3d-signs'),
    'simple', 14500, 17000,
    'Professional 3D reception sign combining brushed aluminium letters with clear acrylic base. Ideal for corporate offices, clinics, and co-working spaces.',
    '["Brushed aluminium letters", "Clear acrylic base", "Wall-mount included", "Custom logo/text"]',
    4.8, 11, 8, 1, 'publish'
);
INSERT INTO product_images (product_id, url, sort_order) VALUES
((SELECT id FROM products WHERE slug = 'office-reception-3d-sign'), '/wallistan_logo.png', 0);
