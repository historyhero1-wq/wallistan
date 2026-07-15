<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
requireAdmin();

$pdo = db();

$stats = [
    'products' => (int) $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn(),
    'categories' => (int) $pdo->query("SELECT COUNT(*) FROM categories")->fetchColumn(),
    'orders' => (int) $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn(),
    'revenue' => (float) $pdo->query("SELECT COALESCE(SUM(total),0) FROM orders WHERE status != 'cancelled'")->fetchColumn(),
];

$recentOrders = $pdo->query(
    "SELECT id, order_number, customer_email, total, status, date_created
     FROM orders ORDER BY date_created DESC LIMIT 8"
)->fetchAll();

$pageTitle = 'Dashboard';
$activeNav = 'dashboard';
require __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div>
    <h1>Dashboard</h1>
    <p>Welcome back, <?= e(adminUser()['name']) ?></p>
  </div>
  <a href="<?= ADMIN_BASE ?>/product-form.php" class="btn btn-primary">+ Add Product</a>
</div>

<div class="stats">
  <div class="stat">
    <div class="stat-label">Products</div>
    <div class="stat-value"><?= $stats['products'] ?></div>
  </div>
  <div class="stat">
    <div class="stat-label">Categories</div>
    <div class="stat-value"><?= $stats['categories'] ?></div>
  </div>
  <div class="stat">
    <div class="stat-label">Orders</div>
    <div class="stat-value"><?= $stats['orders'] ?></div>
  </div>
  <div class="stat">
    <div class="stat-label">Revenue</div>
    <div class="stat-value" style="font-size:1.4rem"><?= formatPkr($stats['revenue']) ?></div>
  </div>
</div>

<div class="card">
  <div class="page-header" style="margin-bottom:1rem">
    <h2 style="font-size:1.2rem;color:var(--maroon)">Recent Orders</h2>
    <a href="<?= ADMIN_BASE ?>/orders.php">View all →</a>
  </div>

  <?php if (count($recentOrders) === 0): ?>
    <div class="empty">No orders yet.</div>
  <?php else: ?>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($recentOrders as $o): ?>
            <tr>
              <td><strong>#<?= e($o['order_number']) ?></strong></td>
              <td><?= e($o['customer_email']) ?></td>
              <td><?= formatPkr((float) $o['total']) ?></td>
              <td><span class="badge badge-<?= e(str_replace(' ', '-', $o['status'])) ?>"><?= e(str_replace('-', ' ', $o['status'])) ?></span></td>
              <td><?= e(date('d M Y', strtotime($o['date_created']))) ?></td>
              <td><a href="<?= ADMIN_BASE ?>/order-view.php?id=<?= (int) $o['id'] ?>" class="btn btn-sm btn-outline">View</a></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
