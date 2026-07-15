<?php

declare(strict_types=1);

class CatalogRepository
{
    private PDO $db;

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function listCategories(): array
    {
        $stmt = $this->db->query(
            'SELECT * FROM categories ORDER BY name ASC'
        );
        return array_map([ProductMapper::class, 'mapCategory'], $stmt->fetchAll());
    }

    public function listProducts(): array
    {
        $stmt = $this->db->query(
            "SELECT p.*, c.slug AS category_slug
             FROM products p
             JOIN categories c ON c.id = p.category_id
             WHERE p.status = 'publish'
             ORDER BY p.featured DESC, p.name ASC"
        );
        $products = $stmt->fetchAll();
        return array_map(fn($p) => $this->loadFullProduct($p), $products);
    }

    public function getProductBySlug(string $slug): ?array
    {
        $stmt = $this->db->prepare(
            "SELECT p.*, c.slug AS category_slug
             FROM products p
             JOIN categories c ON c.id = p.category_id
             WHERE p.slug = ? AND p.status = 'publish'
             LIMIT 1"
        );
        $stmt->execute([$slug]);
        $product = $stmt->fetch();
        if (!$product) {
            return null;
        }
        return $this->loadFullProduct($product);
    }

    private function loadFullProduct(array $product): array
    {
        $id = (int) $product['id'];

        $imgStmt = $this->db->prepare(
            'SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC'
        );
        $imgStmt->execute([$id]);
        $images = $imgStmt->fetchAll();

        $optStmt = $this->db->prepare(
            'SELECT * FROM product_options WHERE product_id = ? ORDER BY sort_order ASC'
        );
        $optStmt->execute([$id]);
        $options = $optStmt->fetchAll();

        $varStmt = $this->db->prepare(
            'SELECT * FROM product_variations WHERE product_id = ? ORDER BY id ASC'
        );
        $varStmt->execute([$id]);
        $variations = $varStmt->fetchAll();

        $revStmt = $this->db->prepare(
            'SELECT * FROM product_reviews WHERE product_id = ? ORDER BY created_at DESC LIMIT 10'
        );
        $revStmt->execute([$id]);
        $reviews = $revStmt->fetchAll();

        return ProductMapper::mapProduct(
            $product,
            $images,
            $options,
            $variations,
            $reviews,
            $product['category_slug']
        );
    }
}
