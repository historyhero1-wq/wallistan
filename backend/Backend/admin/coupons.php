<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
requireAdmin();

$pdo = db();
$editId = isset($_GET['edit']) ? (int) $_GET['edit'] : 0;
$editRow = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();
    $action = $_POST['action'] ?? '';

    if ($action === 'save') {
        $id = (int) ($_POST['id'] ?? 0);
        $code = strtoupper(trim($_POST['code'] ?? ''));
        $label = trim($_POST['label'] ?? '');
        $percentOff = $_POST['percent_off'] !== '' ? (float) $_POST['percent_off'] : null;
        $amountOff = $_POST['amount_off'] !== '' ? (float) $_POST['amount_off'] : null;
        $minSubtotal = $_POST['min_subtotal'] !== '' ? (float) $_POST['min_subtotal'] : null;
        $active = isset($_POST['active']) ? 1 : 0;

        if ($code === '' || $label === '') {
            flash('error', 'Code and label are required.');
            redirect('/coupons.php');
        }

        if ($id > 0) {
            $stmt = $pdo->prepare('UPDATE coupons SET code=?, label=?, percent_off=?, amount_off=?, min_subtotal=?, active=? WHERE id=?');
            $stmt->execute([$code, $label, $percentOff, $amountOff, $minSubtotal, $active, $id]);
            flash('success', 'Coupon updated.');
        } else {
            $stmt = $pdo->prepare('INSERT INTO coupons (code, label, percent_off, amount_off, min_subtotal, active) VALUES (?,?,?,?,?,?)');
            $stmt->execute([$code, $label, $percentOff, $amountOff, $minSubtotal, $active]);
            flash('success', 'Coupon created.');
        }
        redirect('/coupons.php');
    }

    if ($action === 'delete') {
        $id = (int) ($_POST['id'] ?? 0);
        $pdo->prepare('DELETE FROM coupons WHERE id = ?')->execute([$id]);
        flash('success', 'Coupon deleted.');
        redirect('/coupons.php');
    }
}

if ($editId > 0) {
    $stmt = $pdo->prepare('SELECT * FROM coupons WHERE id = ?');
    $stmt->execute([$editId]);
    $editRow = $stmt->fetch() ?: null;
}

$coupons = $pdo->query('SELECT * FROM coupons ORDER BY code')->fetchAll();

$pageTitle = 'Coupons';
$activeNav = 'coupons';
require __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div>
    <h1>Coupons</h1>
    <p>Discount codes for checkout</p>
  </div>
  <?php if ($editRow): ?>
    <a href="<?= ADMIN_BASE ?>/coupons.php" class="btn btn-outline">+ New Coupon</a>
  <?php endif; ?>
</div>

<div class="card">
  <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">
    <?= $editRow ? 'Edit Coupon' : 'Add Coupon' ?>
  </h2>
  <form method="post" class="form-grid form-grid-2">
    <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= (int) ($editRow['id'] ?? 0) ?>">

    <div class="field">
      <label>Code *</label>
      <input name="code" required value="<?= e($editRow['code'] ?? '') ?>" style="text-transform:uppercase">
    </div>
    <div class="field">
      <label>Label *</label>
      <input name="label" required value="<?= e($editRow['label'] ?? '') ?>">
    </div>
    <div class="field">
      <label>Percent Off (%)</label>
      <input type="number" name="percent_off" min="0" max="100" step="0.01" value="<?= e($editRow['percent_off'] ?? '') ?>">
    </div>
    <div class="field">
      <label>Amount Off (PKR)</label>
      <input type="number" name="amount_off" min="0" step="1" value="<?= e($editRow['amount_off'] ?? '') ?>">
    </div>
    <div class="field">
      <label>Min Subtotal (PKR)</label>
      <input type="number" name="min_subtotal" min="0" step="1" value="<?= e($editRow['min_subtotal'] ?? '') ?>">
    </div>
    <div class="field field-check" style="align-self:end">
      <input type="checkbox" name="active" id="active" <?= (int) ($editRow['active'] ?? 1) ? 'checked' : '' ?>>
      <label for="active">Active</label>
    </div>
    <div style="grid-column:1/-1">
      <button type="submit" class="btn btn-primary"><?= $editRow ? 'Update' : 'Create' ?> Coupon</button>
    </div>
  </form>
</div>

<div class="card">
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Code</th><th>Label</th><th>Discount</th><th>Min Order</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <?php foreach ($coupons as $c): ?>
          <tr>
            <td><strong><?= e($c['code']) ?></strong></td>
            <td><?= e($c['label']) ?></td>
            <td>
              <?php if ($c['percent_off']): ?>
                <?= e($c['percent_off']) ?>%
              <?php elseif ($c['amount_off']): ?>
                <?= formatPkr((float) $c['amount_off']) ?>
              <?php else: ?>
                —
              <?php endif; ?>
            </td>
            <td><?= $c['min_subtotal'] ? formatPkr((float) $c['min_subtotal']) : '—' ?></td>
            <td><?= (int) $c['active'] ? '<span class="badge badge-publish">Active</span>' : '<span class="badge badge-draft">Inactive</span>' ?></td>
            <td class="actions">
              <a href="<?= ADMIN_BASE ?>/coupons.php?edit=<?= (int) $c['id'] ?>" class="btn btn-sm btn-outline">Edit</a>
              <form method="post" style="display:inline" onsubmit="return confirm('Delete coupon?')">
                <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?= (int) $c['id'] ?>">
                <button type="submit" class="btn btn-sm btn-danger">Delete</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
