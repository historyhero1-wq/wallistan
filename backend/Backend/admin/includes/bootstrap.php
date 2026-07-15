<?php

declare(strict_types=1);

require_once __DIR__ . '/../../src/Database.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$config = require __DIR__ . '/../../config/config.php';
$dbConfig = require __DIR__ . '/../../config/database.php';

define('ADMIN_BASE', '/wallistan/backend/Backend/admin');
define('UPLOAD_DIR', $config['upload_dir']);
define('UPLOAD_URL', $config['upload_url']);

function db(): PDO
{
    return Database::connection();
}

function slugify(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-') ?: 'item';
}

function e(?string $value): string
{
    return htmlspecialchars($value ?? '', ENT_QUOTES, 'UTF-8');
}

function formatPkr(float $amount): string
{
    return 'PKR ' . number_format($amount, 0, '.', ',');
}

function flash(string $type, string $message): void
{
    $_SESSION['flash'] = ['type' => $type, 'message' => $message];
}

function getFlash(): ?array
{
    if (!isset($_SESSION['flash'])) {
        return null;
    }
    $flash = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $flash;
}

function csrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrf(): void
{
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals($_SESSION['csrf_token'] ?? '', $token)) {
        http_response_code(403);
        exit('Invalid CSRF token');
    }
}

function redirect(string $path): void
{
    header('Location: ' . ADMIN_BASE . $path);
    exit;
}

function handleImageUpload(string $field = 'image_file'): ?string
{
    if (empty($_FILES[$field]['name']) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    if ($_FILES[$field]['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Image upload failed');
    }

    $allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    $mime = mime_content_type($_FILES[$field]['tmp_name']);
    if (!in_array($mime, $allowed, true)) {
        throw new RuntimeException('Only JPG, PNG, WEBP, GIF allowed');
    }

    if (!is_dir(UPLOAD_DIR)) {
        mkdir(UPLOAD_DIR, 0755, true);
    }

    $ext = match ($mime) {
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
        default => 'jpg',
    };
    $filename = uniqid('img_', true) . '.' . $ext;
    $dest = UPLOAD_DIR . '/' . $filename;
    if (!move_uploaded_file($_FILES[$field]['tmp_name'], $dest)) {
        throw new RuntimeException('Could not save uploaded image');
    }

    return UPLOAD_URL . '/' . $filename;
}

function orderStatuses(): array
{
    return [
        'pending' => 'Pending',
        'processing' => 'Processing',
        'on-hold' => 'On Hold',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled',
    ];
}
