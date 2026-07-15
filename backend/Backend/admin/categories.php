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
        $name = trim($_POST['name'] ?? '');
        $slug = trim($_POST['slug'] ?? '') ?: slugify($name);
        $tagline = trim($_POST['tagline'] ?? '');
        $image = trim($_POST['image'] ?? '/wallistan_logo.png');

        try {
            $uploaded = handleImageUpload('image_file');
            if ($uploaded) {
                $image = $uploaded;
            }
        } catch (Throwable $e) {
            flash('error', $e->getMessage());
            redirect('/categories.php' . ($id ? '?edit=' . $id : ''));
        }

        if ($name === '') {
            flash('error', 'Category name is required.');
            redirect('/categories.php');
        }

        if ($id > 0) {
            $stmt = $pdo->prepare('UPDATE categories SET slug=?, name=?, tagline=?, image=? WHERE id=?');
            $stmt->execute([$slug, $name, $tagline, $image, $id]);
            flash('success', 'Category updated.');
        } else {
            $stmt = $pdo->prepare('INSERT INTO categories (slug, name, tagline, image) VALUES (?,?,?,?)');
            $stmt->execute([$slug, $name, $tagline, $image]);
            flash('success', 'Category created.');
        }
        redirect('/categories.php');
    }

    if ($action === 'delete') {
        $id = (int) ($_POST['id'] ?? 0);
        $count = $pdo->prepare('SELECT COUNT(*) FROM products WHERE category_id = ?');
        $count->execute([$id]);
        if ((int) $count->fetchColumn() > 0) {
            flash('error', 'Cannot delete — category has products.');
        } else {
            $pdo->prepare('DELETE FROM categories WHERE id = ?')->execute([$id]);
            flash('success', 'Category deleted.');
        }
        redirect('/categories.php');
    }
}

if ($editId > 0) {
    $stmt = $pdo->prepare('SELECT * FROM categories WHERE id = ?');
    $stmt->execute([$editId]);
    $editRow = $stmt->fetch() ?: null;
}

$categories = $pdo->query('SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count FROM categories c ORDER BY c.name')->fetchAll();

$pageTitle = 'Categories';
$activeNav = 'categories';
require __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div>
    <h1>Categories</h1>
    <p>Manage product categories for the shop</p>
  </div>
  <?php if ($editRow): ?>
    <a href="<?= ADMIN_BASE ?>/categories.php" class="btn btn-outline">+ New Category</a>
  <?php endif; ?>
</div>

<div class="card">
  <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">
    <?= $editRow ? 'Edit Category' : 'Add Category' ?>
  </h2>
  <form method="post" enctype="multipart/form-data" class="form-grid form-grid-2">
    <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
    <input type="hidden" name="action" value="save">
    <input type="hidden" name="id" value="<?= (int) ($editRow['id'] ?? 0) ?>">

    <div class="field">
      <label>Name *</label>
      <input name="name" required value="<?= e($editRow['name'] ?? '') ?>">
    </div>
    <div class="field">
      <label>Slug</label>
      <input name="slug" value="<?= e($editRow['slug'] ?? '') ?>" placeholder="auto-generated">
    </div>
    <div class="field" style="grid-column:1/-1">
      <label>Tagline</label>
      <input name="tagline" value="<?= e($editRow['tagline'] ?? '') ?>">
    </div>
    <div class="field">
      <label>Image URL</label>
      <input name="image" value="<?= e($editRow['image'] ?? '/wallistan_logo.png') ?>">
    </div>
    <div class="field">
      <label>Or upload image</label>
      <input type="file" name="image_file" accept="image/*">
    </div>
    <div style="grid-column:1/-1">
      <button type="submit" class="btn btn-primary"><?= $editRow ? 'Update' : 'Create' ?> Category</button>
    </div>
  </form>
</div>

<div class="card">
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Slug</th>
          <th>Products</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <?php foreach ($categories as $cat): ?>
          <tr>
            <td><img src="<?= e($cat['image']) ?>" alt="" class="thumb"></td>
            <td><strong><?= e($cat['name']) ?></strong><br><small style="color:var(--muted)"><?= e($cat['tagline']) ?></small></td>
            <td><?= e($cat['slug']) ?></td>
            <td><?= (int) $cat['product_count'] ?></td>
            <td class="actions">
              <a href="<?= ADMIN_BASE ?>/categories.php?edit=<?= (int) $cat['id'] ?>" class="btn btn-sm btn-outline">Edit</a>
              <form method="post" style="display:inline" onsubmit="return confirm('Delete this category?')">
                <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
                <input type="hidden" name="action" value="delete">
                <input type="hidden" name="id" value="<?= (int) $cat['id'] ?>">
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
