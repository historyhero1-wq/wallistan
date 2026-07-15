<?php

declare(strict_types=1);

/**
 * One-time setup: creates database tables and seeds sample data.
 * Open in browser: http://localhost/w/Backend/install.php
 */

header('Content-Type: text/html; charset=utf-8');

$schema = file_get_contents(__DIR__ . '/database/schema.sql');
$seed = file_get_contents(__DIR__ . '/database/seed.sql');

try {
    $cfg = require __DIR__ . '/config/database.php';
    $dsn = sprintf('mysql:host=%s;port=%s;charset=%s', $cfg['host'], $cfg['port'], $cfg['charset']);
    $pdo = new PDO($dsn, $cfg['user'], $cfg['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    foreach (array_filter(array_map('trim', explode(';', $schema))) as $statement) {
        if ($statement !== '') {
            $pdo->exec($statement);
        }
    }

    foreach (array_filter(array_map('trim', explode(';', $seed))) as $statement) {
        if ($statement !== '' && !str_starts_with(strtoupper($statement), 'USE ')) {
            $pdo->exec($statement);
        }
    }

    echo '<h1>Wallistan Backend — Installed</h1>';
    echo '<p>Database <strong>wallistan</strong> is ready with sample products.</p>';
    echo '<p><a href="admin/">Admin Panel</a> · <a href="api/health">API health</a> · <a href="api/categories">Categories</a> · <a href="api/products">Products</a></p>';
    echo '<p><strong>Admin login:</strong> admin@wallistan.com / admin123</p>';
} catch (Throwable $e) {
    http_response_code(500);
    echo '<h1>Install failed</h1><pre>' . htmlspecialchars($e->getMessage()) . '</pre>';
}
