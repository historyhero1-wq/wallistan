<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
requireAdmin();

$pdo = db();
$id = (int) ($_GET['id'] ?? 0);

$stmt = $pdo->prepare('SELECT * FROM orders WHERE id = ?');
$stmt->execute([$id]);
$order = $stmt->fetch();

if (!$order) {
    flash('error', 'Order not found.');
    redirect('/orders.php');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'status') {
        $status = $_POST['status'] ?? '';
        if (!array_key_exists($status, orderStatuses())) {
            flash('error', 'Invalid status.');
        } else {
            $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?')->execute([$status, $id]);
            flash('success', 'Order status updated.');
        }
        redirect('/order-view.php?id=' . $id);
    }

    if ($action === 'note') {
        $note = trim($_POST['note'] ?? '');
        if ($note !== '') {
            $pdo->prepare('INSERT INTO order_notes (order_id, note, is_customer_note) VALUES (?,?,0)')
                ->execute([$id, $note]);
            flash('success', 'Note added.');
        }
        redirect('/order-view.php?id=' . $id);
    }
}

$items = $pdo->prepare('SELECT * FROM order_items WHERE order_id = ? ORDER BY id');
$items->execute([$id]);
$lineItems = $items->fetchAll();

$notes = $pdo->prepare('SELECT * FROM order_notes WHERE order_id = ? ORDER BY created_at DESC');
$notes->execute([$id]);
$orderNotes = $notes->fetchAll();

$pageTitle = 'Order #' . $order['order_number'];
$activeNav = 'orders';
require __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div>
    <h1>Order #<?= e($order['order_number']) ?></h1>
    <p><?= e(date('d M Y, H:i', strtotime($order['date_created']))) ?></p>
  </div>
  <a href="<?= ADMIN_BASE ?>/orders.php" class="btn btn-outline">← All Orders</a>
</div>

<div class="detail-grid">
  <div class="card">
    <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">Customer</h2>
    <p><strong><?= e(trim($order['billing_first_name'] . ' ' . $order['billing_last_name'])) ?></strong></p>
    <p><?= e($order['customer_email']) ?></p>
    <p><?= e($order['customer_phone']) ?></p>
    <p style="margin-top:0.75rem"><?= e($order['shipping_address']) ?>, <?= e($order['shipping_city']) ?></p>
    <?php if ($order['customer_note']): ?>
      <div style="margin-top:1rem;padding:0.75rem;background:#faf8f5;border-radius:8px;font-size:0.9rem">
        <strong>Customer note:</strong><br><?= nl2br(e($order['customer_note'])) ?>
      </div>
    <?php endif; ?>
  </div>

  <div class="card">
    <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">Order Status</h2>
    <p style="margin-bottom:0.75rem">
      Current: <span class="badge badge-<?= e($order['status']) ?>"><?= e(str_replace('-', ' ', $order['status'])) ?></span>
    </p>
    <form method="post" class="actions">
      <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
      <input type="hidden" name="action" value="status">
      <select name="status" style="padding:0.5rem;border-radius:8px;border:1px solid var(--border)">
        <?php foreach (orderStatuses() as $val => $label): ?>
          <option value="<?= e($val) ?>" <?= $order['status'] === $val ? 'selected' : '' ?>><?= e($label) ?></option>
        <?php endforeach; ?>
      </select>
      <button type="submit" class="btn btn-sm btn-maroon">Update</button>
    </form>
    <p style="margin-top:1rem;font-size:0.9rem;color:var(--muted)">
      Payment: <?= e($order['payment_method_title']) ?>
      <?php if ($order['coupon_code']): ?> · Coupon: <?= e($order['coupon_code']) ?><?php endif; ?>
    </p>
  </div>
</div>

<div class="card">
  <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">Line Items</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Product</th><th>Qty</th><th>Unit</th><th>Total</th></tr>
      </thead>
      <tbody>
        <?php foreach ($lineItems as $it): ?>
          <tr>
            <td>
              <strong><?= e($it['name']) ?></strong>
              <?php if ($it['selected_options']): ?>
                <?php $opts = json_decode($it['selected_options'], true); ?>
                <?php if (is_array($opts) && count($opts)): ?>
                  <br><small style="color:var(--muted)"><?= e(implode(', ', array_map(fn($k, $v) => "$k: $v", array_keys($opts), $opts))) ?></small>
                <?php endif; ?>
              <?php endif; ?>
            </td>
            <td><?= (int) $it['quantity'] ?></td>
            <td><?= formatPkr((float) $it['unit_price']) ?></td>
            <td><?= formatPkr((float) $it['total']) ?></td>
          </tr>
        <?php endforeach; ?>
      </tbody>
      <tfoot>
        <tr><td colspan="3" style="text-align:right;color:var(--muted)">Subtotal</td><td><?= formatPkr((float) $order['subtotal']) ?></td></tr>
        <?php if ((float) $order['discount_total'] > 0): ?>
          <tr><td colspan="3" style="text-align:right;color:var(--muted)">Discount</td><td>− <?= formatPkr((float) $order['discount_total']) ?></td></tr>
        <?php endif; ?>
        <tr><td colspan="3" style="text-align:right;color:var(--muted)">Shipping</td><td><?= (float) $order['shipping_total'] === 0.0 ? 'Free' : formatPkr((float) $order['shipping_total']) ?></td></tr>
        <tr><td colspan="3" style="text-align:right"><strong>Total</strong></td><td><strong><?= formatPkr((float) $order['total']) ?></strong></td></tr>
      </tfoot>
    </table>
  </div>
</div>

<div class="card">
  <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">Notes &amp; Payment Proofs</h2>
  <?php if (count($orderNotes) === 0): ?>
    <p style="color:var(--muted);font-size:0.9rem">No notes yet.</p>
  <?php else: ?>
    <?php foreach ($orderNotes as $n): ?>
      <div style="padding:0.75rem;margin-bottom:0.5rem;background:#faf8f5;border-radius:8px;font-size:0.9rem">
        <div style="font-size:0.75rem;color:var(--muted);margin-bottom:0.25rem">
          <?= e(date('d M Y H:i', strtotime($n['created_at']))) ?>
          <?= $n['is_customer_note'] ? '· Customer' : '· Admin' ?>
        </div>
        <?= nl2br(e($n['note'])) ?>
      </div>
    <?php endforeach; ?>
  <?php endif; ?>

  <form method="post" style="margin-top:1rem">
    <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
    <input type="hidden" name="action" value="note">
    <div class="field">
      <label>Add admin note</label>
      <textarea name="note" rows="2" placeholder="Internal note or payment verification…"></textarea>
    </div>
    <button type="submit" class="btn btn-sm btn-outline">Add Note</button>
  </form>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
