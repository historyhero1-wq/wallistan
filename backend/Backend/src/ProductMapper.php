<?php

declare(strict_types=1);

class ProductMapper
{
    private static function absoluteUrl(string $url): string
    {
        if (str_starts_with($url, '/wallistan/backend/')) {
            static $origin = null;
            if ($origin === null) {
                $config = require __DIR__ . '/../config/config.php';
                $parsed = parse_url($config['base_url']);
                $origin = ($parsed['scheme'] ?? 'http') . '://' . ($parsed['host'] ?? 'localhost');
                if (!empty($parsed['port'])) {
                    $origin .= ':' . $parsed['port'];
                }
            }
            return $origin . $url;
        }
        return $url;
    }

    public static function mapCategory(array $row): array
    {
        return [
            'slug' => $row['slug'],
            'name' => $row['name'],
            'tagline' => $row['tagline'] ?? $row['name'],
            'image' => self::absoluteUrl($row['image'] ?? '/wallistan_logo.png'),
        ];
    }

    public static function mapProduct(
        array $product,
        array $images,
        array $options,
        array $variations,
        array $reviews,
        string $categorySlug
    ): array {
        $isVariable = $product['product_type'] === 'variable' && count($variations) > 0;
        $mappedVariations = array_map([self::class, 'mapVariation'], $variations);

        $prices = array_column($mappedVariations, 'price');
        $basePrice = $isVariable
            ? (count($prices) ? (int) min($prices) : (int) round((float) $product['base_price']))
            : (int) round((float) $product['base_price']);
        $priceMax = $isVariable && count($prices) ? (int) max($prices) : null;

        $regularPrice = $product['compare_at_price'] !== null ? (int) round((float) $product['compare_at_price']) : null;
        $compareAt = $regularPrice && $regularPrice > $basePrice ? $regularPrice : null;

        $inStockVariations = array_filter($mappedVariations, fn($v) => $v['inStock']);
        $stock = $isVariable
            ? count($inStockVariations)
            : (int) $product['stock'];

        $bullets = $product['bullets'] ? json_decode($product['bullets'], true) : [];
        $faq = $product['faq'] ? json_decode($product['faq'], true) : [];

        $variableOptions = [];
        $customOptions = [];
        foreach ($options as $opt) {
            if (in_array($opt['option_type'], ['text', 'textarea', 'file', 'dimensions'])) {
                $customOptions[] = $opt;
            } else {
                $variableOptions[] = $opt;
            }
        }

        $mappedOptions = $isVariable
            ? self::mapVariableOptions($variableOptions, $mappedVariations)
            : self::mapCustomOptions($variableOptions);

        $mappedOptions = array_merge($mappedOptions, self::mapCustomOptions($customOptions));

        $badges = [];
        if ((int) $product['on_sale'] === 1) {
            $badges[] = 'Sale';
        }

        $result = [
            'slug' => $product['slug'],
            'name' => $product['name'],
            'tagline' => $product['tagline'] ?? $product['name'],
            'categorySlug' => $categorySlug,
            'basePrice' => $basePrice,
            'currency' => 'PKR',
            'images' => array_values(array_map([self::class, 'absoluteUrl'], array_filter(array_column($images, 'url')))),
            'description' => $product['description'] ?? '',
            'bullets' => is_array($bullets) ? $bullets : [],
            'faq' => is_array($faq) ? $faq : [],
            'reviews' => array_map(fn($r) => [
                'author' => $r['author'],
                'city' => $r['city'],
                'rating' => (int) $r['rating'],
                'text' => $r['review_text'],
            ], $reviews),
            'rating' => (float) $product['rating'],
            'reviewCount' => (int) $product['review_count'],
            'options' => $mappedOptions,
            'bestSeller' => (int) $product['featured'] === 1,
            'stock' => $stock,
            'woocommerceId' => (int) $product['id'],
            'productType' => $product['product_type'],
        ];

        if ($compareAt) {
            $result['compareAtPrice'] = $compareAt;
        }
        if ($priceMax) {
            $result['priceMax'] = $priceMax;
        }
        if (count($badges)) {
            $result['badges'] = $badges;
        }
        if ($isVariable) {
            $result['variations'] = $mappedVariations;
        }

        return $result;
    }

    private static function mapVariation(array $row): array
    {
        $price = (int) round((float) $row['price']);
        $regular = $row['regular_price'] !== null ? (int) round((float) $row['regular_price']) : null;

        $result = [
            'id'         => (int) $row['id'],
            'price'      => $price,
            'attributes' => json_decode($row['attributes'], true) ?: [],
            'inStock'    => (int) $row['in_stock'] === 1,
        ];

        if ($regular !== null && $regular > 0) {
            // regular_price is the "Cut Price" (original before discount)
            // price is the "Final Price" (what customer pays)
            // Always pass both so frontend can display the strikethrough
            $result['regularPrice'] = $regular;
        }
        if (!empty($row['image'])) {
            $result['image'] = self::absoluteUrl($row['image']);
        }

        return $result;
    }

    private static function mapVariableOptions(array $options, array $variations): array
    {
        $inStock = array_filter($variations, fn($v) => $v['inStock']);
        $pool = count($inStock) ? $inStock : $variations;
        $mapped = [];

        foreach ($options as $opt) {
            $key = $opt['option_key'];
            $optsJson = $opt['options_json'] ? json_decode($opt['options_json'], true) : [];
            if (!is_array($optsJson) || count($optsJson) === 0) {
                continue;
            }

            $available = [];
            foreach ($pool as $v) {
                if (isset($v['attributes'][$key])) {
                    $available[$v['attributes'][$key]] = true;
                }
            }

            $optionList = array_values(array_filter($optsJson, function ($o) use ($available) {
                return count($available) === 0 || isset($available[$o['value']]);
            }));

            if (count($optionList) === 0) {
                continue;
            }

            // Attach swatch to every option
            $optionList = array_map(function ($o) {
                $swatch = self::getColorSwatch($o['label'] ?? $o['value']);
                if ($swatch !== null) {
                    $o['swatch'] = $swatch;
                }
                return $o;
            }, $optionList);

            $isColorKey = in_array(strtolower($key), ['color', 'colour', 'acrylic-color', 'neon-color', 'text-color', 'color-1', 'color-2']);

            $mapped[] = [
                'id'       => $key,
                'type'     => $isColorKey ? 'color' : 'radio',
                'label'    => $opt['label'],
                'required' => (bool) $opt['required'],
                'options'  => $optionList,
            ];
        }

        return $mapped;
    }

    private static function getColorSwatch(string $label): ?string
    {
        static $map = [
            'opal white'    => '#f5f0eb', 'milky white'   => '#fff8f0',
            'red'           => '#e63946', 'blue'          => '#457b9d',
            'dark blue'     => '#1d3557', 'deep yellow'   => '#f4a300',
            'yellow'        => '#ffd166', 'green'         => '#2d6a4f',
            'dark green'    => '#1b4332', 'light green'   => '#74c69d',
            'purple'        => '#9b5de5', 'golden'        => '#d4af37',
            'transparent'   => 'transparent', 'black'     => '#222222',
            'warm white'    => '#fdf4dc', 'cool white'    => '#e8f4fd',
            'pink purple'   => '#c77dff', 'golden yellow' => '#f9c74f',
            'ice blue'      => '#a8dadc', 'golden mirror' => '#d4af37',
            'silver mirror' => '#c0c0c0', 'silver'        => '#c0c0c0',
            'white'         => '#ffffff',
        ];
        $key = strtolower(trim($label));
        return $map[$key] ?? null;
    }


    private static function mapCustomOptions(array $options): array
    {
        $mapped = [];
        foreach ($options as $opt) {
            $item = [
                'id' => $opt['option_key'],
                'type' => $opt['option_type'],
                'label' => $opt['label'],
            ];
            if ($opt['required']) {
                $item['required'] = true;
            }
            if ($opt['options_json']) {
                $item['options'] = json_decode($opt['options_json'], true) ?: [];
            }
            if ($opt['price_delta'] !== null) {
                $item['priceDelta'] = (float) $opt['price_delta'];
            }
            $mapped[] = $item;
        }
        return $mapped;
    }

    public static function mapOrder(array $order, array $items): array
    {
        return [
            'id' => (int) $order['id'],
            'number' => $order['order_number'],
            'status' => $order['status'],
            'date_created' => date('c', strtotime($order['date_created'])),
            'total' => (string) $order['total'],
            'discount_total' => (string) $order['discount_total'],
            'shipping_total' => (string) $order['shipping_total'],
            'payment_method_title' => $order['payment_method_title'],
            'billing' => [
                'first_name' => $order['billing_first_name'],
                'last_name' => $order['billing_last_name'],
                'email' => $order['customer_email'],
                'phone' => $order['customer_phone'],
                'address_1' => $order['billing_address'],
                'city' => $order['billing_city'],
            ],
            'shipping' => [
                'address_1' => $order['shipping_address'],
                'city' => $order['shipping_city'],
            ],
            'line_items' => array_map(function ($it) {
                $line = [
                    'id' => (int) $it['id'],
                    'name' => $it['name'],
                    'quantity' => (int) $it['quantity'],
                    'total' => (string) $it['total'],
                    'subtotal' => (string) $it['subtotal'],
                    'price' => (float) $it['unit_price'],
                ];
                if (!empty($it['image_url'])) {
                    $line['image'] = ['src' => $it['image_url']];
                }
                return $line;
            }, $items),
            'customer_note' => $order['customer_note'] ?? '',
        ];
    }
}
