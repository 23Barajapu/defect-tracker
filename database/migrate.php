<?php
require_once __DIR__ . '/../config/database.php';

try {
    $db = Database::getInstance()->getConnection();
    echo "Koneksi database OK.\n";

    $schema = file_get_contents(__DIR__ . '/schema.sql');
    $db->exec($schema);
    echo "Skema database berhasil dimigrasi.\n";

    require_once __DIR__ . '/seeder.php';
    echo "Setup Database Selesai 100%.\n";
} catch (Exception $e) {
    echo "Error migrasi: " . $e->getMessage() . "\n";
}
