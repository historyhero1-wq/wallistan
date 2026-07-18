<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
requireAdmin();

$pdo = db();

// ── CSV Export ────────────────────────────────────────────────────────────────
if (isset($_GET['export']) && $_GET['export'] === 'csv') {
    $eSql    = 'SELECT o.*, GROUP_CONCAT(oi.name ORDER BY oi.id SEPARATOR " | ") AS items
                FROM orders o
                LEFT JOIN order_items oi ON oi.order_id = o.id';
    $eParams = [];
    $eWhere  = [];

    if (!empty($_GET['status']))     { $eWhere[] = 'o.status = ?';                             $eParams[] = $_GET['status']; }
    if (!empty($_GET['q']))          { $eWhere[] = '(o.order_number LIKE ? OR o.customer_email LIKE ? OR o.customer_phone LIKE ? OR o.billing_first_name LIKE ?)';
                                       $q = '%' . $_GET['q'] . '%'; $eParams[] = $q; $eParams[] = $q; $eParams[] = $q; $eParams[] = $q; }
    if (!empty($_GET['date_from']))  { $eWhere[] = 'DATE(o.date_created) >= ?';                $eParams[] = $_GET['date_from']; }
    if (!empty($_GET['date_to']))    { $eWhere[] = 'DATE(o.date_created) <= ?';                $eParams[] = $_GET['date_to']; }

    if ($eWhere) $eSql .= ' WHERE ' . implode(' AND ', $eWhere);
    $eSql .= ' GROUP BY o.id ORDER BY o.date_created DESC';

    $eStmt = $pdo->prepare($eSql);
    $eStmt->execute($eParams);
    $rows = $eStmt->fetchAll();

    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="wallistan-orders-' . date('Y-m-d') . '.csv"');
    $out = fopen('php://output', 'w');
    fprintf($out, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM for Excel

    fputcsv($out, ['Order #', 'Date', 'Status', 'Customer Name', 'Email', 'Phone',
                   'Billing Address', 'Billing City', 'Shipping City', 'Items',
                   'Subtotal (PKR)', 'Discount (PKR)', 'Shipping (PKR)', 'Total (PKR)',
                   'Payment Method', 'Coupon', 'Note']);

    foreach ($rows as $r) {
        fputcsv($out, [
            $r['order_number'],
            date('d M Y H:i', strtotime($r['date_created'])),
            $r['status'],
            trim($r['billing_first_name'] . ' ' . $r['billing_last_name']),
            $r['customer_email'],
            $r['customer_phone'],
            $r['billing_address'],
            $r['billing_city'],
            $r['shipping_city'],
            $r['items'] ?? '',
            number_format((float)$r['subtotal'], 2),
            number_format((float)$r['discount_total'], 2),
            number_format((float)$r['shipping_total'], 2),
            number_format((float)$r['total'], 2),
            $r['payment_method_title'],
            $r['coupon_code'] ?? '',
            $r['customer_note'] ?? '',
        ]);
    }
    fclose($out);
    exit;
}

// ── Filters ───────────────────────────────────────────────────────────────────
$statusFilter  = $_GET['status']    ?? '';
$search        = trim($_GET['q']    ?? '');
$dateFrom      = $_GET['date_from'] ?? '';
$dateTo        = $_GET['date_to']   ?? '';

$sql    = 'SELECT * FROM orders';
$params = [];
$where  = [];

if ($statusFilter !== '') {
    $where[]  = 'status = ?';
    $params[] = $statusFilter;
}
if ($search !== '') {
    $where[]  = '(order_number LIKE ? OR customer_email LIKE ? OR customer_phone LIKE ? OR billing_first_name LIKE ?)';
    $q        = '%' . $search . '%';
    $params[] = $q; $params[] = $q; $params[] = $q; $params[] = $q;
}
if ($dateFrom !== '') {
    $where[]  = 'DATE(date_created) >= ?';
    $params[] = $dateFrom;
}
if ($dateTo !== '') {
    $where[]  = 'DATE(date_created) <= ?';
    $params[] = $dateTo;
}

if ($where) {
    $sql .= ' WHERE ' . implode(' AND ', $where);
}
$sql .= ' ORDER BY date_created DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$orders = $stmt->fetchAll();

// ── Summary counts ─────────────────────────────────────────────────────────
$countStmt   = $pdo->query("SELECT status, COUNT(*) AS c FROM orders GROUP BY status");
$statusCounts = [];
foreach ($countStmt->fetchAll() as $row) {
    $statusCounts[$row['status']] = (int)$row['c'];
}
$totalOrders   = array_sum($statusCounts);
$totalRevenue  = (float)$pdo->query("SELECT COALESCE(SUM(total),0) FROM orders WHERE status NOT IN ('cancelled','refunded')")->fetchColumn();

$pageTitle = 'Orders';
$activeNav = 'orders';
require __DIR__ . '/includes/header.php';
?>

<style>
.filter-card { display:flex; flex-wrap:wrap; gap:0.75rem; align-items:flex-end; }
.filter-card .field { display:flex; flex-direction:column; gap:0.3rem; }
.filter-card label { font-size:0.72rem; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); font-weight:600; }
.filter-card input, .filter-card select {
  padding:0.45rem 0.75rem; border-radius:8px; border:1px solid var(--border);
  background:#fff; font-size:0.88rem; height:38px; min-width:140px;
}
.search-row { flex:1; min-width:200px; }
.search-row input { width:100%; }
.stat-pills { display:flex; flex-wrap:wrap; gap:0.75rem; margin-bottom:1.25rem; }
.stat-pill {
  display:flex; align-items:center; gap:0.5rem; padding:0.55rem 1rem;
  background:#fff; border:1px solid var(--border); border-radius:999px;
  font-size:0.82rem; font-weight:600; color:var(--text);
}
.stat-pill span.val { font-size:1.05rem; font-weight:700; color:var(--maroon); }
.export-btn {
  display:inline-flex; align-items:center; gap:0.4rem;
  padding:0.45rem 1rem; border-radius:8px; background:var(--maroon); color:#fff;
  font-size:0.85rem; font-weight:600; border:none; cursor:pointer; text-decoration:none;
  transition:opacity .15s;
}
.export-btn:hover { opacity:.85; }
.order-num { font-weight:700; color:var(--maroon); font-size:0.95rem; }
</style>

<div class="page-header">
  <div>
    <h1>Orders</h1>
    <p><?= $totalOrders ?> total order(s)</p>
  </div>
</div>

<!-- Stat Pills -->
<div class="stat-pills">
  <div class="stat-pill">📦 Total <span class="val"><?= $totalOrders ?></span></div>
  <div class="stat-pill">💰 Revenue <span class="val">PKR <?= number_format($totalRevenue) ?></span></div>
  <?php foreach ($statusCounts as $st => $cnt): ?>
    <div class="stat-pill">
      <span class="badge badge-<?= e($st) ?>"><?= e(ucfirst(str_replace('-', ' ', $st))) ?></span>
      <span class="val"><?= $cnt ?></span>
    </div>
  <?php endforeach; ?>
</div>

<!-- Filters + Export -->
<div class="card" style="margin-bottom:1rem">
  <form method="get" class="filter-card">

    <!-- Search -->
    <div class="field search-row">
      <label>Search</label>
      <input type="text" name="q" value="<?= e($search) ?>" placeholder="Order #, email, phone, name…">
    </div>

    <!-- Status -->
    <div class="field">
      <label>Status</label>
      <select name="status">
        <option value="">All statuses</option>
        <?php foreach (orderStatuses() as $val => $label): ?>
          <option value="<?= e($val) ?>" <?= $statusFilter === $val ? 'selected' : '' ?>><?= e($label) ?></option>
        <?php endforeach; ?>
      </select>
    </div>

    <!-- Date From -->
    <div class="field">
      <label>From Date</label>
      <input type="date" name="date_from" value="<?= e($dateFrom) ?>">
    </div>

    <!-- Date To -->
    <div class="field">
      <label>To Date</label>
      <input type="date" name="date_to" value="<?= e($dateTo) ?>">
    </div>

    <div class="field" style="justify-content:flex-end">
      <label>&nbsp;</label>
      <div style="display:flex;gap:0.5rem;align-items:center">
        <button type="submit" class="btn btn-primary" style="height:38px">🔍 Search</button>
        <a href="<?= ADMIN_BASE ?>/orders.php" class="btn btn-outline" style="height:38px">Clear</a>
      </div>
    </div>
  </form>

  <!-- Export CSV button (preserves current filters) -->
  <div style="margin-top:0.75rem;padding-top:0.75rem;border-top:1px solid var(--border);display:flex;justify-content:flex-end">
    <?php
    $exportParams = http_build_query([
      'export'    => 'csv',
      'status'    => $statusFilter,
      'q'         => $search,
      'date_from' => $dateFrom,
      'date_to'   => $dateTo,
    ]);
    ?>
    <a href="<?= ADMIN_BASE ?>/orders.php?<?= $exportParams ?>" class="export-btn">
      ⬇ Export to CSV
    </a>
  </div>
</div>

<!-- Orders Table -->
<div class="card">
  <?php if (count($orders) === 0): ?>
    <div class="empty">No orders found for the selected filters.</div>
  <?php else: ?>
    <div style="margin-bottom:0.5rem;font-size:0.82rem;color:var(--muted)">
      Showing <?= count($orders) ?> order(s)
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order #</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Location</th>
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
              <td><span class="order-num">#<?= e($o['order_number']) ?></span></td>
              <td>
                <div style="font-weight:600"><?= e(trim($o['billing_first_name'] . ' ' . $o['billing_last_name'])) ?></div>
                <div style="font-size:0.78rem;color:var(--muted)"><?= e($o['customer_email']) ?></div>
              </td>
              <td><?= e($o['customer_phone']) ?></td>
              <td>
                <div><?= e($o['billing_city']) ?></div>
                <?php if ($o['shipping_city'] && $o['shipping_city'] !== $o['billing_city']): ?>
                  <div style="font-size:0.78rem;color:var(--muted)">→ <?= e($o['shipping_city']) ?></div>
                <?php endif; ?>
              </td>
              <td><?= e($o['payment_method_title']) ?></td>
              <td style="font-weight:700"><?= formatPkr((float)$o['total']) ?></td>
              <td><span class="badge badge-<?= e($o['status']) ?>"><?= e(str_replace('-', ' ', $o['status'])) ?></span></td>
              <td style="white-space:nowrap"><?= e(date('d M Y', strtotime($o['date_created']))) ?><br>
                <span style="font-size:0.75rem;color:var(--muted)"><?= e(date('H:i', strtotime($o['date_created']))) ?></span>
              </td>
              <td><a href="<?= ADMIN_BASE ?>/order-view.php?id=<?= (int)$o['id'] ?>" class="btn btn-sm btn-outline">View</a></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
