<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
requireAdmin();

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $action = $_POST['action'] ?? '';
    if ($action === 'delete') {
        $id = (int) ($_POST['id'] ?? 0);
        $pdo->prepare('DELETE FROM products WHERE id = ?')->execute([$id]);
        flash('success', 'Product deleted.');
        redirect('/products.php');
    }
}

$products = $pdo->query(
    "SELECT p.*, c.name AS category_name,
      (SELECT url FROM product_images pi WHERE pi.product_id = p.id ORDER BY sort_order LIMIT 1) AS thumb
     FROM products p
     JOIN categories c ON c.id = p.category_id
     ORDER BY p.created_at DESC"
)->fetchAll();

$pageTitle = 'Products';
$activeNav = 'products';
require __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div>
    <h1>Products</h1>
    <p><?= count($products) ?> product(s) in catalog</p>
  </div>
  <a href="<?= ADMIN_BASE ?>/product-form.php" class="btn btn-primary">+ Add Product</a>
</div>

<div class="card">
  <?php if (count($products) === 0): ?>
    <div class="empty">No products yet. <a href="<?= ADMIN_BASE ?>/product-form.php">Add your first product</a></div>
  <?php else: ?>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Type</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($products as $p): ?>
            <tr>
              <td>
                <?php if ($p['thumb']): ?>
                  <img src="<?= e($p['thumb']) ?>" alt="" class="thumb">
                <?php endif; ?>
              </td>
              <td>
                <strong><?= e($p['name']) ?></strong><br>
                <small style="color:var(--muted)"><?= e($p['slug']) ?></small>
              </td>
              <td><?= e($p['category_name']) ?></td>
              <td><?= formatPkr((float) $p['base_price']) ?></td>
              <td><?= e($p['product_type']) ?></td>
              <td><?= (int) $p['stock'] ?></td>
              <td><span class="badge badge-<?= e($p['status']) ?>"><?= e($p['status']) ?></span></td>
              <td class="actions">
                <a href="<?= ADMIN_BASE ?>/product-form.php?id=<?= (int) $p['id'] ?>" class="btn btn-sm btn-outline">Edit</a>
                <form method="post" style="display:inline" onsubmit="return confirm('Delete this product?')">
                  <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
                  <input type="hidden" name="action" value="delete">
                  <input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
                  <button type="submit" class="btn btn-sm btn-danger">Delete</button>
                </form>
              </td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
