<?php

declare(strict_types=1);

/** @var string $pageTitle */
/** @var string $activeNav */
/** @var bool $showNav */
/** @var bool $fullPage */

$showNav = $showNav ?? true;
$fullPage = $fullPage ?? false;
$admin = adminUser();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?= e($pageTitle ?? 'Admin') ?> — Wallistan</title>
  <link rel="stylesheet" href="<?= ADMIN_BASE ?>/assets/admin.css">
</head>
<body>
<?php if ($showNav && $admin): ?>
<header class="topbar">
  <div class="topbar-inner">
    <a href="<?= ADMIN_BASE ?>/dashboard.php" class="brand">Wallistan <span>Admin</span></a>
    <nav class="nav">
      <a href="<?= ADMIN_BASE ?>/dashboard.php" class="<?= ($activeNav ?? '') === 'dashboard' ? 'active' : '' ?>">Dashboard</a>
      <a href="<?= ADMIN_BASE ?>/categories.php" class="<?= ($activeNav ?? '') === 'categories' ? 'active' : '' ?>">Categories</a>
      <a href="<?= ADMIN_BASE ?>/products.php" class="<?= ($activeNav ?? '') === 'products' ? 'active' : '' ?>">Products</a>
      <a href="<?= ADMIN_BASE ?>/orders.php" class="<?= ($activeNav ?? '') === 'orders' ? 'active' : '' ?>">Orders</a>
      <a href="<?= ADMIN_BASE ?>/coupons.php" class="<?= ($activeNav ?? '') === 'coupons' ? 'active' : '' ?>">Coupons</a>
    </nav>
    <div class="topbar-right">
      <span class="admin-name"><?= e($admin['name']) ?></span>
      <a href="<?= ADMIN_BASE ?>/logout.php" class="btn btn-sm btn-outline">Logout</a>
    </div>
  </div>
</header>
<?php endif; ?>

<?php if (!$fullPage): ?>
<main class="main">
  <?php $flash = getFlash(); if ($flash): ?>
    <div class="alert alert-<?= e($flash['type']) ?>"><?= e($flash['message']) ?></div>
  <?php endif; ?>
<?php endif; ?>
