<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
requireAdmin();

$pdo = db();
$statusFilter = $_GET['status'] ?? '';

$sql = 'SELECT * FROM orders';
$params = [];
if ($statusFilter !== '') {
    $sql .= ' WHERE status = ?';
    $params[] = $statusFilter;
}
$sql .= ' ORDER BY date_created DESC';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();

$pageTitle = 'Orders';
$activeNav = 'orders';
require __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div>
    <h1>Orders</h1>
    <p><?= count($orders) ?> order(s)</p>
  </div>
</div>

<div class="card" style="margin-bottom:1rem">
  <form method="get" class="actions">
    <select name="status" onchange="this.form.submit()" style="padding:0.5rem;border-radius:8px;border:1px solid var(--border)">
      <option value="">All statuses</option>
      <?php foreach (orderStatuses() as $val => $label): ?>
        <option value="<?= e($val) ?>" <?= $statusFilter === $val ? 'selected' : '' ?>><?= e($label) ?></option>
      <?php endforeach; ?>
    </select>
    <?php if ($statusFilter): ?>
      <a href="<?= ADMIN_BASE ?>/orders.php" class="btn btn-sm btn-outline">Clear filter</a>
    <?php endif; ?>
  </form>
</div>

<div class="card">
  <?php if (count($orders) === 0): ?>
    <div class="empty">No orders found.</div>
  <?php else: ?>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Payment</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($orders as $o): ?>
            <tr>
              <td><strong>#<?= e($o['order_number']) ?></strong></td>
              <td><?= e($o['customer_email']) ?></td>
              <td><?= e($o['customer_phone']) ?></td>
              <td><?= e($o['payment_method_title']) ?></td>
              <td><?= formatPkr((float) $o['total']) ?></td>
              <td><span class="badge badge-<?= e($o['status']) ?>"><?= e(str_replace('-', ' ', $o['status'])) ?></span></td>
              <td><?= e(date('d M Y H:i', strtotime($o['date_created']))) ?></td>
              <td><a href="<?= ADMIN_BASE ?>/order-view.php?id=<?= (int) $o['id'] ?>" class="btn btn-sm btn-outline">View</a></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
