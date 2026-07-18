<?php

declare(strict_types=1);

class OrderRepository
{
    private PDO $db;

    private const PAYMENT_METHODS = [
        'cod' => ['id' => 'cod', 'title' => 'Cash on Delivery', 'status' => 'processing'],
        'bank_transfer' => ['id' => 'bacs', 'title' => 'Bank Transfer', 'status' => 'on-hold'],
        'jazzcash' => ['id' => 'other', 'title' => 'JazzCash', 'status' => 'on-hold'],
        'easypaisa' => ['id' => 'other', 'title' => 'Easypaisa', 'status' => 'on-hold'],
    ];

    public function __construct()
    {
        $this->db = Database::connection();
    }

    public function create(array $input): array
    {
        $items = $input['items'] ?? [];
        if (count($items) === 0) {
            throw new InvalidArgumentException('Cart is empty');
        }

        foreach ($items as $item) {
            if (empty($item['woocommerceProductId'])) {
                throw new InvalidArgumentException('Cart items must be linked to products');
            }
        }

        $payment = self::PAYMENT_METHODS[$input['paymentMethod'] ?? 'cod'] ?? self::PAYMENT_METHODS['cod'];
        $nameParts = $this->splitName($input['contactName'] ?? '');
        $discount = (float) ($input['discount'] ?? 0);
        $shippingFee = (float) ($input['shippingFee'] ?? 0);
        $subtotal = (float) ($input['subtotal'] ?? 0);
        $total = (float) ($input['total'] ?? 0);
        $orderNumber = $this->nextOrderNumber();

        $this->db->beginTransaction();
        try {
            $stmt = $this->db->prepare(
                'INSERT INTO orders (
                    order_number, status, payment_method, payment_method_title,
                    customer_email, customer_phone,
                    billing_first_name, billing_last_name, billing_address, billing_city,
                    shipping_address, shipping_city,
                    subtotal, discount_total, shipping_total, total,
                    coupon_code, customer_note
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $stmt->execute([
                $orderNumber,
                $payment['status'],
                $payment['id'],
                $payment['title'],
                trim($input['contactEmail'] ?? ''),
                trim($input['contactPhone'] ?? ''),
                $nameParts['first'],
                $nameParts['last'],
                trim($input['shippingAddress'] ?? ''),
                trim($input['shippingCity'] ?? ''),
                trim($input['shippingAddress'] ?? ''),
                trim($input['shippingCity'] ?? ''),
                $subtotal,
                $discount,
                $shippingFee,
                $total,
                $input['couponCode'] ?? null,
                $input['notes'] ?? null,
            ]);

            $orderId = (int) $this->db->lastInsertId();

            $itemStmt = $this->db->prepare(
                'INSERT INTO order_items (
                    order_id, product_id, variation_id, name, quantity,
                    unit_price, subtotal, total, selected_options, image_url
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );

            foreach ($items as $item) {
                $qty = (int) ($item['quantity'] ?? 1);
                $unitPrice = (float) ($item['unitPrice'] ?? 0);
                $lineTotal = $unitPrice * $qty;
                $itemStmt->execute([
                    $orderId,
                    (int) $item['woocommerceProductId'],
                    !empty($item['woocommerceVariationId']) ? (int) $item['woocommerceVariationId'] : null,
                    $item['productName'] ?? 'Product',
                    $qty,
                    $unitPrice,
                    $lineTotal,
                    $lineTotal,
                    json_encode($item['selectedOptions'] ?? []),
                    $item['imageUrl'] ?? null,
                ]);
            }

            $this->db->commit();

            return [
                'orderId' => $orderId,
                'orderNumber' => $orderNumber,
                'email' => trim($input['contactEmail'] ?? ''),
            ];
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function getById(int $id, string $email): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM orders WHERE id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $order = $stmt->fetch();
        if (!$order || !$this->emailMatches($order['customer_email'], $email)) {
            return null;
        }
        return $this->loadOrder($order);
    }

    public function findByNumber(string $number, string $email): ?array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM orders WHERE order_number = ? LIMIT 1'
        );
        $stmt->execute([$number]);
        $order = $stmt->fetch();
        if (!$order || !$this->emailMatches($order['customer_email'], $email)) {
            return null;
        }
        return $this->loadOrder($order);
    }

    public function addPaymentNote(int $orderId, string $email, array $body): bool
    {
        $stmt = $this->db->prepare('SELECT * FROM orders WHERE id = ? LIMIT 1');
        $stmt->execute([$orderId]);
        $order = $stmt->fetch();
        if (!$order || !$this->emailMatches($order['customer_email'], $email)) {
            return false;
        }

        $note = implode("\n", array_filter([
            'Payment proof submitted via Wallistan storefront',
            !empty($body['method']) ? 'Method: ' . $body['method'] : '',
            !empty($body['reference']) ? 'Reference: ' . $body['reference'] : '',
            $body['message'] ?? '',
        ]));

        $noteStmt = $this->db->prepare(
            'INSERT INTO order_notes (order_id, note, is_customer_note) VALUES (?, ?, 1)'
        );
        $noteStmt->execute([$orderId, $note]);

        return true;
    }

    private function loadOrder(array $order): array
    {
        $stmt = $this->db->prepare(
            'SELECT * FROM order_items WHERE order_id = ? ORDER BY id ASC'
        );
        $stmt->execute([(int) $order['id']]);
        $items = $stmt->fetchAll();
        return ProductMapper::mapOrder($order, $items);
    }

    private function nextOrderNumber(): string
    {
        // Generate a unique random order number like WAL-472831
        do {
            $num = 'WAL-' . str_pad((string) random_int(100000, 999999), 6, '0', STR_PAD_LEFT);
            $exists = $this->db->prepare('SELECT id FROM orders WHERE order_number = ?');
            $exists->execute([$num]);
        } while ($exists->fetch());
        return $num;
    }

    private function splitName(string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName)) ?: [];
        if (count($parts) === 0) {
            return ['first' => 'Customer', 'last' => '-'];
        }
        if (count($parts) === 1) {
            return ['first' => $parts[0], 'last' => '-'];
        }
        return ['first' => $parts[0], 'last' => implode(' ', array_slice($parts, 1))];
    }

    private function emailMatches(string $stored, string $provided): bool
    {
        return strtolower(trim($stored)) === strtolower(trim($provided));
    }
}
