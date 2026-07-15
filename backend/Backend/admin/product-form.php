<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';
requireAdmin();

$pdo = db();
$id = isset($_GET['id']) ? (int) $_GET['id'] : 0;
$product = null;
$images = [];
$options = [];
$variations = [];

$categories = $pdo->query('SELECT id, name FROM categories ORDER BY name')->fetchAll();

if ($id > 0) {
    $stmt = $pdo->prepare('SELECT * FROM products WHERE id = ?');
    $stmt->execute([$id]);
    $product = $stmt->fetch();
    if (!$product) {
        flash('error', 'Product not found.');
        redirect('/products.php');
    }
    $imgStmt = $pdo->prepare('SELECT url FROM product_images WHERE product_id = ? ORDER BY sort_order');
    $imgStmt->execute([$id]);
    $images = array_column($imgStmt->fetchAll(), 'url');

    $optStmt = $pdo->prepare('SELECT * FROM product_options WHERE product_id = ? ORDER BY sort_order');
    $optStmt->execute([$id]);
    $options = $optStmt->fetchAll();

    $varStmt = $pdo->prepare('SELECT * FROM product_variations WHERE product_id = ? ORDER BY id');
    $varStmt->execute([$id]);
    $variations = $varStmt->fetchAll();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verifyCsrf();

    $name = trim($_POST['name'] ?? '');
    $slug = trim($_POST['slug'] ?? '') ?: slugify($name);
    $tagline = trim($_POST['tagline'] ?? '');
    $categoryId = (int) ($_POST['category_id'] ?? 0);
    $productType = $_POST['product_type'] === 'variable' ? 'variable' : 'simple';
    $basePrice = (float) ($_POST['base_price'] ?? 0);
    $compareAt = $_POST['compare_at_price'] !== '' ? (float) $_POST['compare_at_price'] : null;
    $description = trim($_POST['description'] ?? '');
    $bulletsRaw = trim($_POST['bullets'] ?? '');
    $bullets = array_values(array_filter(array_map('trim', explode("\n", $bulletsRaw))));
    $stock = (int) ($_POST['stock'] ?? 0);
    $featured = isset($_POST['featured']) ? 1 : 0;
    $onSale = isset($_POST['on_sale']) ? 1 : 0;
    $status = $_POST['status'] === 'draft' ? 'draft' : 'publish';
    $imageUrls = array_values(array_filter(array_map('trim', explode("\n", $_POST['image_urls'] ?? ''))));
    $rating = (float) ($_POST['rating'] ?? 0);
    $reviewCount = (int) ($_POST['review_count'] ?? 0);

    $editId = (int) ($_POST['id'] ?? 0);

    if ($name === '' || $categoryId <= 0) {
        flash('error', 'Name and category are required.');
        redirect('/product-form.php' . ($editId ? '?id=' . $editId : ''));
    }

    try {
        if (!empty($_FILES['image_files']['name'][0])) {
            foreach ($_FILES['image_files']['name'] as $i => $filename) {
                if ($_FILES['image_files']['error'][$i] !== UPLOAD_ERR_OK) {
                    continue;
                }
                $tmp = [
                    'name' => $_FILES['image_files']['name'][$i],
                    'type' => $_FILES['image_files']['type'][$i],
                    'tmp_name' => $_FILES['image_files']['tmp_name'][$i],
                    'error' => $_FILES['image_files']['error'][$i],
                    'size' => $_FILES['image_files']['size'][$i],
                ];
                $_FILES['single_upload'] = $tmp;
                $url = handleImageUpload('single_upload');
                if ($url) {
                    $imageUrls[] = $url;
                }
            }
        }
    } catch (Throwable $e) {
        flash('error', $e->getMessage());
        redirect('/product-form.php' . ($editId ? '?id=' . $editId : ''));
    }

    if (count($imageUrls) === 0) {
        $imageUrls = ['/wallistan_logo.png'];
    }

    $pdo->beginTransaction();
    try {
        if ($editId > 0) {
            $stmt = $pdo->prepare(
                'UPDATE products SET slug=?, name=?, tagline=?, category_id=?, product_type=?, base_price=?,
                 compare_at_price=?, description=?, bullets=?, stock=?, featured=?, on_sale=?, status=?, rating=?, review_count=? WHERE id=?'
            );
            $stmt->execute([
                $slug, $name, $tagline, $categoryId, $productType, $basePrice,
                $compareAt, $description, json_encode($bullets), $stock, $featured, $onSale, $status, $rating, $reviewCount, $editId,
            ]);
            $productId = $editId;
            $pdo->prepare('DELETE FROM product_images WHERE product_id = ?')->execute([$productId]);
            $pdo->prepare('DELETE FROM product_options WHERE product_id = ?')->execute([$productId]);
            $pdo->prepare('DELETE FROM product_variations WHERE product_id = ?')->execute([$productId]);
        } else {
            $stmt = $pdo->prepare(
                'INSERT INTO products (slug, name, tagline, category_id, product_type, base_price, compare_at_price,
                 description, bullets, stock, featured, on_sale, status, rating, review_count) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
            );
            $stmt->execute([
                $slug, $name, $tagline, $categoryId, $productType, $basePrice,
                $compareAt, $description, json_encode($bullets), $stock, $featured, $onSale, $status, $rating, $reviewCount,
            ]);
            $productId = (int) $pdo->lastInsertId();
        }

        $imgStmt = $pdo->prepare('INSERT INTO product_images (product_id, url, sort_order) VALUES (?,?,?)');
        foreach ($imageUrls as $i => $url) {
            $imgStmt->execute([$productId, $url, $i]);
        }

        if ($productType === 'variable') {
            $optKeys = $_POST['opt_key'] ?? [];
            $optLabels = $_POST['opt_label'] ?? [];
            $optValues = $_POST['opt_values'] ?? [];

            $optStmt = $pdo->prepare(
                'INSERT INTO product_options (product_id, option_key, label, option_type, required, options_json, sort_order) VALUES (?,?,?,?,?,?,?)'
            );

            foreach ($optKeys as $i => $key) {
                $key = trim($key);
                $label = trim($optLabels[$i] ?? '');
                $valuesRaw = trim($optValues[$i] ?? '');
                if ($key === '' || $label === '') {
                    continue;
                }
                $valueList = array_values(array_filter(array_map('trim', explode(',', $valuesRaw))));
                $optionsJson = json_encode(array_map(fn($v) => ['value' => slugify($v), 'label' => $v], $valueList));
                $optStmt->execute([$productId, slugify($key), $label, 'radio', 1, $optionsJson, $i]);
            }

            $varAttrs = $_POST['var_attr'] ?? [];
            $varPrices = $_POST['var_price'] ?? [];
            $varRegularPrices = $_POST['var_regular_price'] ?? [];
            $varStocks = $_POST['var_stock'] ?? [];

            $varStmt = $pdo->prepare(
                'INSERT INTO product_variations (product_id, price, regular_price, attributes, stock_quantity, in_stock) VALUES (?,?,?,?,?,?)'
            );

            foreach ($varPrices as $i => $price) {
                $attrJson = $varAttrs[$i] ?? '{}';
                $attrs = json_decode($attrJson, true);
                if (!is_array($attrs) || count($attrs) === 0) {
                    continue;
                }
                $normalized = [];
                foreach ($attrs as $k => $v) {
                    $normalized[slugify($k)] = slugify((string) $v);
                }
                $stockQty = (int) ($varStocks[$i] ?? 0);
                $regPrice = (float) ($varRegularPrices[$i] ?? 0);
                $varStmt->execute([
                    $productId,
                    (float) $price,
                    $regPrice > 0 ? $regPrice : null,
                    json_encode($normalized),
                    $stockQty,
                    $stockQty > 0 ? 1 : 0,
                ]);
            }
        }

        $customKeys = $_POST['custom_opt_key'] ?? [];
        $customLabels = $_POST['custom_opt_label'] ?? [];
        $customTypes = $_POST['custom_opt_type'] ?? [];
        $customReqs = $_POST['custom_opt_required'] ?? [];

        $customStmt = $pdo->prepare(
            'INSERT INTO product_options (product_id, option_key, label, option_type, required, sort_order) VALUES (?,?,?,?,?,?)'
        );

        foreach ($customKeys as $i => $key) {
            $key = trim($key);
            $label = trim($customLabels[$i] ?? '');
            $type = $customTypes[$i] ?? 'text';
            $req = (int) ($customReqs[$i] ?? 0);
            if ($key === '' || $label === '') {
                continue;
            }
            $customStmt->execute([$productId, slugify($key), $label, $type, $req, 100 + $i]);
        }

        $pdo->commit();
        flash('success', $editId ? 'Product updated.' : 'Product created.');
        redirect('/product-form.php?id=' . $productId);
    } catch (Throwable $e) {
        $pdo->rollBack();
        flash('error', 'Save failed: ' . $e->getMessage());
        redirect('/product-form.php' . ($editId ? '?id=' . $editId : ''));
    }
}

$bulletsText = '';
if ($product && $product['bullets']) {
    $decoded = json_decode($product['bullets'], true);
    if (is_array($decoded)) {
        $bulletsText = implode("\n", $decoded);
    }
}

$pageTitle = $product ? 'Edit Product' : 'Add Product';
$activeNav = 'products';
require __DIR__ . '/includes/header.php';
?>

<div class="page-header">
  <div>
    <h1><?= $product ? 'Edit Product' : 'Add Product' ?></h1>
    <p><?= $product ? e($product['name']) : 'Create a new catalog item' ?></p>
  </div>
  <a href="<?= ADMIN_BASE ?>/products.php" class="btn btn-outline">← Back to Products</a>
</div>

<form method="post" enctype="multipart/form-data">
  <input type="hidden" name="csrf_token" value="<?= e(csrfToken()) ?>">
  <input type="hidden" name="id" value="<?= (int) ($product['id'] ?? 0) ?>">

  <div class="card">
    <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">Basic Info</h2>
    <div class="form-grid form-grid-2">
      <div class="field">
        <label>Product Name *</label>
        <input name="name" required value="<?= e($product['name'] ?? '') ?>">
      </div>
      <div class="field">
        <label>Slug</label>
        <input name="slug" value="<?= e($product['slug'] ?? '') ?>" placeholder="auto-generated">
      </div>
      <div class="field" style="grid-column:1/-1">
        <label>Tagline</label>
        <input name="tagline" value="<?= e($product['tagline'] ?? '') ?>">
      </div>
      <div class="field">
        <label>Category *</label>
        <select name="category_id" required>
          <option value="">Select category</option>
          <?php foreach ($categories as $c): ?>
            <option value="<?= (int) $c['id'] ?>" <?= (int) ($product['category_id'] ?? 0) === (int) $c['id'] ? 'selected' : '' ?>>
              <?= e($c['name']) ?>
            </option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="field">
        <label>Product Type</label>
        <select name="product_type" id="productType">
          <option value="simple" <?= ($product['product_type'] ?? 'simple') === 'simple' ? 'selected' : '' ?>>Simple</option>
          <option value="variable" <?= ($product['product_type'] ?? '') === 'variable' ? 'selected' : '' ?>>Variable</option>
        </select>
      </div>
      <div class="field">
        <label>Base Price (PKR)</label>
        <input type="number" name="base_price" min="0" step="1" value="<?= e((string) ($product['base_price'] ?? '0')) ?>">
      </div>
      <div class="field">
        <label>Compare-at Price (PKR)</label>
        <input type="number" name="compare_at_price" min="0" step="1" value="<?= e($product['compare_at_price'] ?? '') ?>" placeholder="Optional sale compare">
      </div>
      <div class="field" id="stockField">
        <label>Stock</label>
        <input type="number" name="stock" min="0" value="<?= (int) ($product['stock'] ?? 0) ?>">
      </div>
      <div class="field">
        <label>Status</label>
        <select name="status">
          <option value="publish" <?= ($product['status'] ?? 'publish') === 'publish' ? 'selected' : '' ?>>Published</option>
          <option value="draft" <?= ($product['status'] ?? '') === 'draft' ? 'selected' : '' ?>>Draft</option>
        </select>
      </div>
      <div class="field">
        <label>Fake Rating (e.g. 4.8)</label>
        <input type="number" name="rating" step="0.1" min="0" max="5" value="<?= e((string) ($product['rating'] ?? '0')) ?>">
      </div>
      <div class="field">
        <label>Fake Review Count</label>
        <input type="number" name="review_count" value="<?= (int) ($product['review_count'] ?? 0) ?>">
      </div>
      <div class="field field-check">
        <input type="checkbox" name="featured" id="featured" <?= (int) ($product['featured'] ?? 0) ? 'checked' : '' ?>>
        <label for="featured">Featured / Best Seller</label>
      </div>
      <div class="field field-check">
        <input type="checkbox" name="on_sale" id="on_sale" <?= (int) ($product['on_sale'] ?? 0) ? 'checked' : '' ?>>
        <label for="on_sale">On Sale badge</label>
      </div>
    </div>
  </div>

  <div class="card">
    <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">Description</h2>
    <div class="form-grid">
      <div class="field">
        <label>Description</label>
        <textarea name="description" rows="5"><?= e($product['description'] ?? '') ?></textarea>
      </div>
      <div class="field">
        <label>Bullet Points (one per line)</label>
        <textarea name="bullets" rows="4" placeholder="Feature 1&#10;Feature 2"><?= e($bulletsText) ?></textarea>
      </div>
    </div>
  </div>

  <div class="card">
    <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:1rem">Images</h2>
    <div class="form-grid">
      <div class="field">
        <label>Image URLs (one per line)</label>
        <textarea name="image_urls" rows="3" placeholder="/wallistan_logo.png"><?= e(implode("\n", $images)) ?></textarea>
      </div>
      <div class="field">
        <label>Upload images</label>
        <input type="file" name="image_files[]" accept="image/*" multiple>
        <small>Uploaded images are added to the list above</small>
      </div>
    </div>
  </div>

  <div class="card" id="customizationsSection">
    <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:0.5rem">Customizations (Personalization & Uploads)</h2>
    <p style="font-size:0.85rem;color:var(--muted);margin-bottom:1rem">
      Add fields like text inputs or file uploads that customers can fill before adding to cart.
    </p>
    
    <div id="customizationsContainer">
      <?php
      $customOpts = array_filter($options, fn($o) => in_array($o['option_type'], ['text', 'textarea', 'file']));
      foreach ($customOpts as $opt):
      ?>
        <div class="form-grid form-grid-2" style="margin-bottom:0.75rem;padding:0.75rem;background:#f0f9ff;border-radius:8px;position:relative;padding-right:3rem;">
          <div class="field">
            <label>Option Key (internal)</label>
            <input name="custom_opt_key[]" value="<?= e($opt['option_key'] ?? '') ?>" placeholder="e.g. engraving_text">
          </div>
          <div class="field">
            <label>Label (Shown to customer)</label>
            <input name="custom_opt_label[]" value="<?= e($opt['label'] ?? '') ?>" placeholder="e.g. Engraving Text">
          </div>
          <div class="field">
            <label>Type</label>
            <select name="custom_opt_type[]">
              <option value="text" <?= $opt['option_type'] === 'text' ? 'selected' : '' ?>>Short Text</option>
              <option value="textarea" <?= $opt['option_type'] === 'textarea' ? 'selected' : '' ?>>Long Text</option>
              <option value="file" <?= $opt['option_type'] === 'file' ? 'selected' : '' ?>>File Upload</option>
            </select>
          </div>
          <div class="field">
            <label>Required</label>
            <select name="custom_opt_required[]">
              <option value="1" <?= $opt['required'] ? 'selected' : '' ?>>Yes</option>
              <option value="0" <?= !$opt['required'] ? 'selected' : '' ?>>No</option>
            </select>
          </div>
          <button type="button" class="btn btn-sm btn-danger" style="position:absolute;top:0.75rem;right:0.75rem;" onclick="this.parentElement.remove()">×</button>
        </div>
      <?php endforeach; ?>
    </div>
    
    <button type="button" class="btn btn-sm btn-outline" onclick="addCustomization()">+ Add Customization Field</button>
  </div>

  <div class="card" id="variationsSection" style="<?= (($product['product_type'] ?? 'simple') !== 'variable') ? 'display:none' : '' ?>">
    <h2 style="font-size:1.1rem;color:var(--maroon);margin-bottom:0.5rem">Variable Product Options</h2>
    <p style="font-size:0.85rem;color:var(--muted);margin-bottom:1rem">
      Define attributes (e.g. Size, Color) and their values comma-separated. Then add variation rows.
    </p>

    <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
      <button type="button" class="btn btn-sm" style="background:#e5e7eb;color:#374151" onclick="addPreset('size')">+ Sizes</button>
      <button type="button" class="btn btn-sm" style="background:#e5e7eb;color:#374151" onclick="addPreset('acrylic')">+ Acrylic Colors</button>
      <button type="button" class="btn btn-sm" style="background:#e5e7eb;color:#374151" onclick="addPreset('neon')">+ Neon Colors</button>
      <button type="button" class="btn btn-sm" style="background:#e5e7eb;color:#374151" onclick="addPreset('text')">+ Text Colors</button>
    </div>

    <div id="optionsContainer">
      <?php
      $optRows = count($options) ? $options : [['option_key' => 'size', 'label' => 'Size', 'options_json' => '[]']];
      foreach ($optRows as $i => $opt):
        $vals = '';
        if (!empty($opt['options_json'])) {
            $decoded = json_decode($opt['options_json'], true);
            if (is_array($decoded)) {
                $vals = implode(', ', array_column($decoded, 'label'));
            }
        }
      ?>
        <div class="form-grid form-grid-2" style="margin-bottom:0.75rem;padding:0.75rem;background:#faf8f5;border-radius:8px;position:relative;padding-right:3rem;">
          <div class="field">
            <label>Option Key</label>
            <input name="opt_key[]" value="<?= e($opt['option_key'] ?? '') ?>" placeholder="size">
          </div>
          <div class="field">
            <label>Label</label>
            <input name="opt_label[]" value="<?= e($opt['label'] ?? '') ?>" placeholder="Size">
          </div>
          <div class="field" style="grid-column:1/-1">
            <label>Values (comma separated)</label>
            <input name="opt_values[]" value="<?= e($vals) ?>" placeholder="Small, Medium, Large">
          </div>
          <button type="button" class="btn btn-sm btn-danger" style="position:absolute;top:0.75rem;right:0.75rem;" onclick="this.parentElement.remove()">×</button>
        </div>
      <?php endforeach; ?>
    </div>
    <button type="button" class="btn btn-sm btn-outline" onclick="addOption()">+ Add Option</button>

    <h3 style="font-size:1rem;margin:1.25rem 0 0.75rem;color:var(--maroon)">Variations</h3>
    <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
      <button type="button" class="btn btn-sm btn-primary" onclick="generateVariations()">Auto-Generate Variations</button>
      <button type="button" class="btn btn-sm btn-secondary" onclick="showManualVariationForm()">Select & Add Variation</button>
    </div>
    <p style="font-size:0.8rem;color:var(--muted);margin-bottom:0.75rem">
      Click "Auto-Generate" to create rows for every combination, or "Select & Add" to pick specific variations from a list.
    </p>
    <label style="display:inline-flex; align-items:center; gap:0.5rem; margin-bottom:1rem; cursor:pointer; font-size:0.9rem;">
      <input type="checkbox" id="manageVarStock" checked onchange="toggleVarStock()"> Manage Stock Quantity
    </label>
    <div id="manualVariationContainer"></div>
    <div id="variationsContainer">
      <?php foreach ($variations as $v):
        $attrs = json_decode($v['attributes'], true) ?: [];
        $attrPairs = [];
        foreach ($attrs as $k => $val) {
            $attrPairs[] = '"' . $k . '":"' . $val . '"';
        }
        $attrStr = '{' . implode(',', $attrPairs) . '}';
        
        $optLabels = [];
        foreach ($options as $opt) {
            $optLabels[slugify($opt['option_key'])] = $opt['label'];
        }

        $displayLabels = [];
        foreach ($attrs as $k => $val) {
            $labelName = $optLabels[$k] ?? ucwords(str_replace('-', ' ', $k));
            $displayLabels[] = $labelName . ': ' . ucwords(str_replace('-', ' ', $val));
        }
        $displayStr = implode(' | ', $displayLabels);
      ?>
        <div class="variation-row" style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:1rem;">
          <div style="flex:1;font-weight:500;font-size:0.95rem;">
            <?= e($displayStr ?: 'Default') ?>
            <input type="hidden" name="var_attr[]" value="<?= e($attrStr) ?>">
          </div>
          <div class="field" style="margin:0;width:100px;">
            <label style="font-size:0.75rem;margin-bottom:0.25rem;">Price</label>
            <input type="number" name="var_regular_price[]" value="<?= e((string) ($v['regular_price'] ?? '')) ?>" min="0" placeholder="e.g. 100">
          </div>
          <div class="field" style="margin:0;width:100px;">
            <label style="font-size:0.75rem;margin-bottom:0.25rem;">Sale Price</label>
            <input type="number" name="var_price[]" value="<?= e((string) $v['price']) ?>" min="0">
          </div>
          <div class="field var-stock-col" style="margin:0;width:80px;">
            <label style="font-size:0.75rem;margin-bottom:0.25rem;">Stock</label>
            <input type="number" name="var_stock[]" value="<?= (int) $v['stock_quantity'] ?>" min="0">
          </div>
          <button type="button" class="btn btn-sm btn-danger" style="margin-top:1.2rem;" onclick="this.closest('.variation-row').remove()">×</button>
        </div>
      <?php endforeach; ?>
    </div>
  </div>

  <div style="margin-top:1rem">
    <button type="submit" class="btn btn-primary"><?= $product ? 'Save Changes' : 'Create Product' ?></button>
  </div>
</form>

<script>
const productType = document.getElementById('productType');
const variationsSection = document.getElementById('variationsSection');
const stockField = document.getElementById('stockField');

productType.addEventListener('change', () => {
  const isVar = productType.value === 'variable';
  variationsSection.style.display = isVar ? '' : 'none';
  stockField.style.display = isVar ? 'none' : '';
});

function addOption() {
  const html = `<div class="form-grid form-grid-2" style="margin-bottom:0.75rem;padding:0.75rem;background:#faf8f5;border-radius:8px;position:relative;padding-right:3rem;">
    <div class="field"><label>Option Key</label><input name="opt_key[]" placeholder="color"></div>
    <div class="field"><label>Label</label><input name="opt_label[]" placeholder="Colour"></div>
    <div class="field" style="grid-column:1/-1"><label>Values (comma separated)</label><input name="opt_values[]" placeholder="Red, Blue, Green"></div>
    <button type="button" class="btn btn-sm btn-danger" style="position:absolute;top:0.75rem;right:0.75rem;" onclick="this.parentElement.remove()">×</button>
  </div>`;
  document.getElementById('optionsContainer').insertAdjacentHTML('beforeend', html);
}

function addPreset(type) {
  let key = ''; let label = ''; let vals = '';
  if (type === 'size') {
    key = 'size'; label = 'Size'; vals = '12 × 12 Inches (12” × 12”), 18 × 18 Inches (18” × 18”), 24 × 24 Inches (24” × 24”), 30 × 30 Inches (30” × 30”), 36 × 36 Inches (36” × 36”)';
  } else if (type === 'acrylic') {
    key = 'color'; label = 'Acrylic Color'; vals = 'Opal White, Milky White, Red, Blue, Dark Blue, Deep Yellow, Yellow, Green, Dark Green, Light Green, Purple, Golden, Transparent, Black';
  } else if (type === 'neon') {
    key = 'neon-color'; label = 'Neon Color'; vals = 'Red, Warm White, Pink Purple, Cool White, Yellow, Blue, Green, Golden Yellow, Ice Blue';
  } else if (type === 'text') {
    key = 'text-color'; label = 'Text Color'; vals = 'Golden Mirror, Silver Mirror, Opal White, Milky White, Red, Blue, Dark Blue, Deep Yellow, Yellow, Green, Dark Green, Light Green, Purple, Transparent, Black';
  }
  const html = `<div class="form-grid form-grid-2" style="margin-bottom:0.75rem;padding:0.75rem;background:#faf8f5;border-radius:8px;position:relative;padding-right:3rem;">
    <div class="field"><label>Option Key</label><input name="opt_key[]" value="${key}"></div>
    <div class="field"><label>Label</label><input name="opt_label[]" value="${label}"></div>
    <div class="field" style="grid-column:1/-1"><label>Values (comma separated)</label><input name="opt_values[]" value="${vals}"></div>
    <button type="button" class="btn btn-sm btn-danger" style="position:absolute;top:0.75rem;right:0.75rem;" onclick="this.parentElement.remove()">×</button>
  </div>`;
  document.getElementById('optionsContainer').insertAdjacentHTML('beforeend', html);
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

function ucwords(str) {
  return (str + '').replace(/^(.)|\s+(.)/g, function ($1) {
    return $1.toUpperCase();
  });
}

const COLOR_MAP = {
  'opal-white': '#f5f0eb', 'milky-white': '#fff8f0', 'red': '#e63946', 'blue': '#457b9d',
  'dark-blue': '#1d3557', 'deep-yellow': '#f4a300', 'yellow': '#ffd166', 'green': '#2d6a4f',
  'dark-green': '#1b4332', 'light-green': '#74c69d', 'purple': '#9b5de5', 'golden': '#d4af37',
  'transparent': null, 'black': '#222222', 'warm-white': '#fdf4dc', 'cool-white': '#e8f4fd',
  'pink-purple': '#c77dff', 'golden-yellow': '#f9c74f', 'ice-blue': '#a8dadc',
  'golden-mirror': '#d4af37', 'silver-mirror': '#c0c0c0', 'silver': '#c0c0c0',
  'white': '#ffffff',
};

function getSwatchHtml(label) {
  const key = slugify(label);
  const color = COLOR_MAP[key];
  if (!color) return '';
  if (key === 'transparent') {
    return '<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:linear-gradient(135deg,#ccc 25%,transparent 25%,transparent 75%,#ccc 75%),linear-gradient(135deg,#eee 25%,#ccc 25%);background-size:6px 6px;border:1px solid rgba(0,0,0,0.25);vertical-align:middle;margin-right:4px;"></span>';
  }
  return `<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${color};border:1px solid rgba(0,0,0,0.2);vertical-align:middle;margin-right:4px;"></span>`;
}

function buildVarDisplayHtml(displayLabels, rawValueLabels) {
  return displayLabels.map((lbl, i) => {
    const parts = lbl.split(': ');
    const key = parts[0];
    const val = parts.slice(1).join(': ');
    const swatch = getSwatchHtml(rawValueLabels[i]);
    return `<span>${key}: ${swatch}<span>${val}</span></span>`;
  }).join(' <span style="color:#999;margin:0 4px;">|</span> ');
}

function generateVariations() {
  const keys = Array.from(document.querySelectorAll('input[name="opt_key[]"]')).map(el => el.value.trim());
  const labels = Array.from(document.querySelectorAll('input[name="opt_label[]"]')).map(el => el.value.trim());
  const values = Array.from(document.querySelectorAll('input[name="opt_values[]"]')).map(el => el.value.trim());
  
  let validOptions = [];
  for(let i=0; i<keys.length; i++) {
    if(keys[i] && values[i]) {
      const vals = values[i].split(',').map(v => v.trim()).filter(v => v);
      if(vals.length > 0) {
        const optLabel = (labels[i] && labels[i].trim()) ? labels[i].trim() : keys[i];
        validOptions.push({
          key: slugify(keys[i]),
          label: ucwords(optLabel),
          values: vals.map(v => ({ label: v, slug: slugify(v) }))
        });
      }
    }
  }

  if(validOptions.length === 0) {
    alert("Please add at least one Option with values before generating variations.");
    return;
  }

  const combinations = validOptions.reduce((a, b) => {
    return a.reduce((r, v) => r.concat(b.values.map(w => [].concat(v, w))), []);
  }, [[]]);

  const container = document.getElementById('variationsContainer');
  
  const existingRows = Array.from(container.querySelectorAll('.variation-row'));
  const existingData = {};
  existingRows.forEach(row => {
    const attrInput = row.querySelector('input[name="var_attr[]"]');
    if(attrInput) {
      existingData[attrInput.value] = {
        price: row.querySelector('input[name="var_price[]"]').value,
        regPrice: row.querySelector('input[name="var_regular_price[]"]').value,
        stock: row.querySelector('input[name="var_stock[]"]').value
      };
    }
  });

  container.innerHTML = '';

  combinations.forEach(combo => {
    const attrs = {};
    const displayLabels = [];
    const rawValueLabels = [];
    combo.forEach((valObj, index) => {
      attrs[validOptions[index].key] = valObj.slug;
      displayLabels.push(`${validOptions[index].label}: ${valObj.label}`);
      rawValueLabels.push(valObj.label);
    });

    const attrStr = JSON.stringify(attrs);
    const displayHtml = buildVarDisplayHtml(displayLabels, rawValueLabels);

    const existing = existingData[attrStr] || { 
      price: document.querySelector('input[name="base_price"]').value || '0', 
      regPrice: document.querySelector('input[name="compare_at_price"]').value || '',
      stock: '10' 
    };

    const html = `<div class="variation-row" style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:1rem;">
      <div style="flex:1;font-weight:500;font-size:0.95rem;">
        ${displayHtml}
        <input type="hidden" name="var_attr[]" value='${attrStr.replace(/'/g, "&#39;")}'>
      </div>
      <div class="field" style="margin:0;width:100px;">
        <label style="font-size:0.75rem;margin-bottom:0.25rem;">Price</label>
        <input type="number" name="var_regular_price[]" value="${existing.regPrice}" min="0" placeholder="e.g. 100">
      </div>
      <div class="field" style="margin:0;width:100px;">
        <label style="font-size:0.75rem;margin-bottom:0.25rem;">Sale Price</label>
        <input type="number" name="var_price[]" value="${existing.price}" min="0">
      </div>
      <div class="field var-stock-col" style="margin:0;width:80px;">
        <label style="font-size:0.75rem;margin-bottom:0.25rem;">Stock</label>
        <input type="number" name="var_stock[]" value="${existing.stock}" min="0">
      </div>
      <button type="button" class="btn btn-sm btn-danger" style="margin-top:1.2rem;" onclick="this.closest('.variation-row').remove()">×</button>
    </div>`;
    container.insertAdjacentHTML('beforeend', html);
  });
  toggleVarStock(); // apply current stock visibility state
}

function showManualVariationForm() {
  const keys = Array.from(document.querySelectorAll('input[name="opt_key[]"]')).map(el => el.value.trim());
  const values = Array.from(document.querySelectorAll('input[name="opt_values[]"]')).map(el => el.value.trim());
  
  let validOptions = [];
  for(let i=0; i<keys.length; i++) {
    const labelInput = document.querySelectorAll('input[name="opt_label[]"]')[i];
    const optLabel = labelInput && labelInput.value.trim() ? labelInput.value.trim() : keys[i];
    if(keys[i] && values[i]) {
      const vals = values[i].split(',').map(v => v.trim()).filter(v => v);
      if(vals.length > 0) {
        validOptions.push({
          key: slugify(keys[i]),
          label: ucwords(optLabel),
          values: vals.map(v => ({ label: v, slug: slugify(v) }))
        });
      }
    }
  }

  if(validOptions.length === 0) {
    alert("Please add at least one Option with values before selecting variations.");
    return;
  }

  let html = `<div style="background:#faf8f5; border:1px solid var(--border); padding:1rem; border-radius:8px; margin-bottom:1rem; display:flex; gap:1rem; align-items:flex-end; flex-wrap:wrap; box-shadow:0 2px 4px rgba(0,0,0,0.05);">`;
  
  validOptions.forEach((opt, index) => {
    html += `<div class="field" style="margin:0;"><label style="font-size:0.8rem;margin-bottom:0.25rem;font-weight:600;color:var(--maroon);">${ucwords(opt.label)}</label><select class="manual-opt-select" data-key="${opt.key}" data-opt-label="${ucwords(opt.label)}" style="padding:0.5rem; border:1px solid var(--border); border-radius:4px; min-width:150px; background:#fff;">`;
    opt.values.forEach(v => {
      html += `<option value="${v.slug}" data-label="${v.label}">${v.label}</option>`;
    });
    html += `</select></div>`;
  });
  
  html += `<button type="button" class="btn btn-sm btn-success" style="padding:0.5rem 1rem;" onclick="insertManualVariation()">Add This Variation</button>`;
  html += `<button type="button" class="btn btn-sm btn-outline" style="padding:0.5rem 1rem;" onclick="this.parentElement.remove()">Cancel</button>`;
  html += `</div>`;

  document.getElementById('manualVariationContainer').innerHTML = html;
}

function insertManualVariation() {
  const selects = Array.from(document.querySelectorAll('.manual-opt-select'));
  const attrs = {};
  const displayLabels = [];
  const rawValueLabels = [];
  
  selects.forEach(sel => {
    const key = sel.getAttribute('data-key');
    const option = sel.options[sel.selectedIndex];
    const valSlug = option.value;
    const valLabel = option.getAttribute('data-label');
    const optLabelStr = sel.getAttribute('data-opt-label');
    
    attrs[key] = valSlug;
    displayLabels.push(`${optLabelStr}: ${valLabel}`);
    rawValueLabels.push(valLabel);
  });

  const attrStr = JSON.stringify(attrs);
  const displayHtml = buildVarDisplayHtml(displayLabels, rawValueLabels);
  
  const existingRows = Array.from(document.getElementById('variationsContainer').querySelectorAll('.variation-row'));
  for(let row of existingRows) {
    const attrInput = row.querySelector('input[name="var_attr[]"]');
    if(attrInput && attrInput.value === attrStr) {
      alert("This variation has already been added.");
      return;
    }
  }

  const basePriceInput = document.querySelector('input[name="base_price"]');
  const basePrice = basePriceInput ? basePriceInput.value : '0';
  const comparePriceInput = document.querySelector('input[name="compare_at_price"]');
  const regPrice = comparePriceInput ? comparePriceInput.value : '';
  
  const html = `<div class="variation-row" style="background:#fff;border:1px solid var(--border);border-radius:8px;padding:1rem;margin-bottom:0.5rem;display:flex;align-items:center;gap:1rem;">
    <div style="flex:1;font-weight:500;font-size:0.95rem;">
      ${displayHtml}
      <input type="hidden" name="var_attr[]" value='${attrStr.replace(/'/g, "&#39;")}'>
    </div>
    <div class="field" style="margin:0;width:100px;">
      <label style="font-size:0.75rem;margin-bottom:0.25rem;">Price</label>
      <input type="number" name="var_regular_price[]" value="${regPrice}" min="0" placeholder="e.g. 100">
    </div>
    <div class="field" style="margin:0;width:100px;">
      <label style="font-size:0.75rem;margin-bottom:0.25rem;">Sale Price</label>
      <input type="number" name="var_price[]" value="${basePrice}" min="0">
    </div>
    <div class="field var-stock-col" style="margin:0;width:80px;">
      <label style="font-size:0.75rem;margin-bottom:0.25rem;">Stock</label>
      <input type="number" name="var_stock[]" value="10" min="0">
    </div>
    <button type="button" class="btn btn-sm btn-danger" style="margin-top:1.2rem;" onclick="this.closest('.variation-row').remove()">×</button>
  </div>`;
  
  const container = document.getElementById('variationsContainer');
  container.insertAdjacentHTML('beforeend', html);
  toggleVarStock(); // Apply stock visibility
  
  const newRow = container.lastElementChild;
  newRow.style.transition = "background 0.5s";
  newRow.style.background = "#e6f4ea";
  setTimeout(() => { newRow.style.background = "#fff"; }, 500);
}

function toggleVarStock() {
  const show = document.getElementById('manageVarStock').checked;
  document.querySelectorAll('.var-stock-col').forEach(el => {
    el.style.display = show ? 'block' : 'none';
  });
}

// Initial toggle on load
document.addEventListener('DOMContentLoaded', () => {
  toggleVarStock();
});

function addCustomization() {
  const html = `<div class="form-grid form-grid-2" style="margin-bottom:0.75rem;padding:0.75rem;background:#f0f9ff;border-radius:8px;position:relative;padding-right:3rem;">
    <div class="field"><label>Option Key (internal)</label><input name="custom_opt_key[]" placeholder="e.g. logo_upload"></div>
    <div class="field"><label>Label (Shown to customer)</label><input name="custom_opt_label[]" placeholder="e.g. Upload Logo"></div>
    <div class="field">
      <label>Type</label>
      <select name="custom_opt_type[]">
        <option value="text">Short Text</option>
        <option value="textarea">Long Text</option>
        <option value="file">File Upload</option>
      </select>
    </div>
    <div class="field">
      <label>Required</label>
      <select name="custom_opt_required[]">
        <option value="0">No</option>
        <option value="1">Yes</option>
      </select>
    </div>
    <button type="button" class="btn btn-sm btn-danger" style="position:absolute;top:0.75rem;right:0.75rem;" onclick="this.parentElement.remove()">×</button>
  </div>`;
  document.getElementById('customizationsContainer').insertAdjacentHTML('beforeend', html);
}
</script>

<?php require __DIR__ . '/includes/footer.php'; ?>
