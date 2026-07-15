<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/auth.php';

if (adminUser()) {
    redirect('/dashboard.php');
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    if ($email === '' || $password === '') {
        $error = 'Email and password are required.';
    } elseif (attemptLogin($email, $password)) {
        redirect('/dashboard.php');
    } else {
        $error = 'Invalid email or password.';
    }
}

$pageTitle = 'Login';
$showNav = false;
$fullPage = true;
require __DIR__ . '/includes/header.php';
?>

<div class="login-page">
  <div class="login-card">
    <div class="brand-login">Wallistan</div>
    <h1>Admin Login</h1>
    <p class="subtitle">Manage products, orders &amp; categories</p>

    <?php if ($error): ?>
      <div class="alert alert-error"><?= e($error) ?></div>
    <?php endif; ?>

    <form method="post" class="form-grid">
      <div class="field">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" required autofocus value="<?= e($_POST['email'] ?? '') ?>">
      </div>
      <div class="field">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" required>
      </div>
      <button type="submit" class="btn btn-maroon" style="width:100%;margin-top:0.5rem">Sign in</button>
    </form>
    <p style="margin-top:1.25rem;font-size:0.8rem;color:var(--muted)">
      Default: admin@wallistan.com / admin123
    </p>
  </div>
</div>

<?php require __DIR__ . '/includes/footer.php'; ?>
