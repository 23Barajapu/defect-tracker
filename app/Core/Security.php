<?php
// Modul Keamanan: Masking Data Sensitif Perbankan (PAN, PIN, CVV) & Sanitasi Input

class Security {
    /**
     * Bersihkan input dari potensi XSS
     */
    public static function clean(?string $data): string {
        if ($data === null) return '';
        return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Masking data sensitif perbankan pada payload JSON / ISO 8583 / Text Log
     * - PAN (Primary Account Number / Nomor Kartu 16-19 digit) -> 411111******1111
     * - CVV / CVC (3-4 digit) -> ***
     * - PIN / PIN Block -> [PIN_MASKED]
     * - Password / Token -> [CONFIDENTIAL_MASKED]
     */
    public static function maskSensitiveData(?string $payload): ?string {
        if (empty($payload)) return $payload;

        $masked = $payload;

        // 1. Masking JSON key "pan", "card_number", "cardNumber", "account_number" (16 digits)
        $masked = preg_replace_callback(
            '/("(?:pan|card_number|cardNumber|nomor_kartu|cardNo)"\s*:\s*")(\d{6})(\d{4,9})(\d{4})(")/i',
            function ($m) {
                return $m[1] . $m[2] . str_repeat('*', strlen($m[3])) . $m[4] . $m[5];
            },
            $masked
        );

        // 2. Masking JSON key "cvv", "cvc", "cvv2", "pin", "pin_block", "password"
        $masked = preg_replace(
            '/("(?:cvv|cvc|cvv2|security_code)"\s*:\s*")([^"]+)(")/i',
            '$1***$3',
            $masked
        );

        $masked = preg_replace(
            '/("(?:pin|pin_block|pinBlock|mpin|password|secret)"\s*:\s*")([^"]+)(")/i',
            '$1[PIN_MASKED]$3',
            $masked
        );

        // 3. Masking nomor kartu 16-19 digit standalone dalam string / log raw
        $masked = preg_replace_callback(
            '/\b(\d{6})(\d{6,9})(\d{4})\b/',
            function ($m) {
                return $m[1] . str_repeat('*', strlen($m[2])) . $m[3];
            },
            $masked
        );

        // 4. Masking ISO 8583 raw BIT 2 (Primary Account Number) & BIT 52 (PIN Block)
        $masked = preg_replace_callback(
            '/(BIT2=|\bPAN=)(\d{6})(\d{6,9})(\d{4})([\s|]|$)/i',
            function ($m) {
                return $m[1] . $m[2] . str_repeat('*', strlen($m[3])) . $m[4] . $m[5];
            },
            $masked
        );

        $masked = preg_replace(
            '/(BIT52=|PIN_DATA=)([A-Fa-f0-9]{16})([\s|]|$)/i',
            '$1[PIN_BLOCK_MASKED]$3',
            $masked
        );

        return $masked;
    }

    /**
     * Format Rupiah helper
     */
    public static function formatRupiah(float|int $amount): string {
        return 'Rp ' . number_format($amount, 0, ',', '.');
    }
}
