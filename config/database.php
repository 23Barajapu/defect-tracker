<?php
// Konfigurasi Database PDO Singleton
class Database {
    private static ?Database $instance = null;
    private PDO $pdo;

    private function __construct() {
        $host = '127.0.0.1';
        $port = '3306';
        $dbname = 'sistem_pkl_defect';
        $username = 'root';
        $password = '';

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            (class_exists(\Pdo\Mysql::class) ? \Pdo\Mysql::ATTR_INIT_COMMAND : PDO::MYSQL_ATTR_INIT_COMMAND) => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ];

        try {
            $this->pdo = new PDO($dsn, $username, $password, $options);
        } catch (PDOException $e) {
            // Jika DB belum dibuat, coba konek tanpa nama DB untuk buat DB
            try {
                $rootDsn = "mysql:host={$host};port={$port};charset=utf8mb4";
                $tmpPdo = new PDO($rootDsn, $username, $password, $options);
                $tmpPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbname}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
                $this->pdo = new PDO($dsn, $username, $password, $options);
            } catch (PDOException $inner) {
                die("Koneksi Database Gagal: " . $inner->getMessage());
            }
        }
    }

    public static function getInstance(): Database {
        if (self::$instance === null) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection(): PDO {
        return $this->pdo;
    }
}
