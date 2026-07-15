<?php

declare(strict_types=1);

require_once __DIR__ . '/bootstrap.php';

function adminUser(): ?array
{
    return $_SESSION['admin'] ?? null;
}

function requireAdmin(): void
{
    if (!adminUser()) {
        redirect('/index.php');
    }
}

function attemptLogin(string $email, string $password): bool
{
    $stmt = db()->prepare('SELECT * FROM admins WHERE email = ? LIMIT 1');
    $stmt->execute([trim($email)]);
    $admin = $stmt->fetch();
    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        return false;
    }
    $_SESSION['admin'] = [
        'id' => (int) $admin['id'],
        'email' => $admin['email'],
        'name' => $admin['name'],
    ];
    return true;
}

function logoutAdmin(): void
{
    unset($_SESSION['admin']);
    session_destroy();
}
