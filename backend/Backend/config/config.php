<?php

return [
    'app_name' => 'Wallistan API',
    'base_url' => getenv('API_BASE_URL') ?: 'http://localhost/wallistan/backend/Backend',
    'cors_origins' => [
        'http://localhost:8080', 'http://127.0.0.1:8080',
        'http://localhost:5173', 'http://127.0.0.1:5173',
        'http://localhost',
    ],
    'upload_dir' => __DIR__ . '/../uploads',
    'upload_url' => '/wallistan/backend/Backend/uploads',
];
