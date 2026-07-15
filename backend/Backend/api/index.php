<?php

declare(strict_types=1);

require_once __DIR__ . '/../src/Database.php';
require_once __DIR__ . '/../src/Response.php';
require_once __DIR__ . '/../src/ProductMapper.php';
require_once __DIR__ . '/../src/CatalogRepository.php';
require_once __DIR__ . '/../src/OrderRepository.php';

Response::cors();

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'] ?? '/';

// Strip base path: /wallistan/backend/Backend/api/categories -> categories
$basePath = '/wallistan/backend/Backend/api';
$path = parse_url($uri, PHP_URL_PATH) ?: '/';
if (str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath));
}
$path = trim($path, '/');
$segments = $path === '' ? [] : explode('/', $path);

try {
  // GET /categories
  if ($method === 'GET' && ($segments === ['categories'] || $path === 'categories')) {
      $repo = new CatalogRepository();
      Response::json($repo->listCategories());
  }

  // GET /products
  if ($method === 'GET' && ($segments === ['products'] || $path === 'products')) {
      $repo = new CatalogRepository();
      Response::json($repo->listProducts());
  }

  // GET /products/{slug}
  if ($method === 'GET' && count($segments) === 2 && $segments[0] === 'products') {
      $repo = new CatalogRepository();
      $product = $repo->getProductBySlug($segments[1]);
      if (!$product) {
          Response::error('Not found', 404);
      }
      Response::json($product);
  }

  // GET /orders/lookup?number=&email=
  if ($method === 'GET' && count($segments) === 2 && $segments[0] === 'orders' && $segments[1] === 'lookup') {
      $number = trim($_GET['number'] ?? '');
      $email = trim($_GET['email'] ?? '');
      if ($number === '' || $email === '') {
          Response::error('Order number and email are required', 400);
      }
      $repo = new OrderRepository();
      $order = $repo->findByNumber($number, $email);
      if (!$order) {
          Response::error('Order not found', 404);
      }
      Response::json($order);
  }

  // POST /orders
  if ($method === 'POST' && ($segments === ['orders'] || $path === 'orders')) {
      $body = json_decode(file_get_contents('php://input') ?: '{}', true);
      if (!is_array($body)) {
          Response::error('Invalid JSON body', 400);
      }
      $repo = new OrderRepository();
      $result = $repo->create($body);
      Response::json($result);
  }

  // GET /orders/{id}?email=
  if ($method === 'GET' && count($segments) === 2 && $segments[0] === 'orders' && $segments[1] !== 'lookup') {
      $orderId = (int) $segments[1];
      $email = trim($_GET['email'] ?? '');
      if ($orderId <= 0) {
          Response::error('Invalid order id', 400);
      }
      if ($email === '') {
          Response::error('Email is required', 400);
      }
      $repo = new OrderRepository();
      $order = $repo->getById($orderId, $email);
      if (!$order) {
          Response::error('Order not found', 404);
      }
      Response::json($order);
  }

  // POST /orders/{id} — payment proof
  if ($method === 'POST' && count($segments) === 2 && $segments[0] === 'orders') {
      $orderId = (int) $segments[1];
      $body = json_decode(file_get_contents('php://input') ?: '{}', true);
      if (!is_array($body)) {
          Response::error('Invalid JSON body', 400);
      }
      $email = trim($body['email'] ?? '');
      if ($orderId <= 0) {
          Response::error('Invalid order id', 400);
      }
      if ($email === '') {
          Response::error('Email is required', 400);
      }
      $repo = new OrderRepository();
      $ok = $repo->addPaymentNote($orderId, $email, $body);
      if (!$ok) {
          Response::error('Order not found', 404);
      }
      Response::json(['ok' => true]);
  }

  // Health check
  if ($method === 'GET' && ($path === '' || $path === 'health')) {
      Response::json(['status' => 'ok', 'service' => 'Wallistan API']);
  }

  Response::error('Not found', 404);
} catch (InvalidArgumentException $e) {
  Response::error($e->getMessage(), 400);
} catch (PDOException $e) {
  error_log('DB Error: ' . $e->getMessage());
  Response::error('Database error', 500);
} catch (Throwable $e) {
  error_log('API Error: ' . $e->getMessage());
  Response::error('Internal server error', 500);
}
