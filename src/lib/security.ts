// Modul Keamanan: Masking Data Sensitif Perbankan (PAN, PIN, CVV) & ISO 8583 Visual Parser

export interface IsoBitField {
  bit: number;
  name: string;
  value: string;
  maskedValue: string;
  isSensitive: boolean;
}

export interface IsoParseResult {
  mti: string;
  fields: IsoBitField[];
  raw: string;
  maskedRaw: string;
}

export class Security {
  /**
   * Masking data sensitif perbankan pada payload JSON / ISO 8583 / Plain Text
   */
  static maskSensitiveData(payload: string | null | undefined): string {
    if (!payload) return '';

    let masked = payload;

    // 1. JSON key "pan", "card_number", "cardNumber", "account_number" (16 digits)
    masked = masked.replace(
      /("(?:pan|card_number|cardNumber|nomor_kartu|cardNo)"\s*:\s*")(\d{6})(\d{4,9})(\d{4})(")/gi,
      (_match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}${'*'.repeat(p3.length)}${p4}${p5}`;
      }
    );

    // 2. JSON key "cvv", "cvc", "cvv2"
    masked = masked.replace(
      /("(?:cvv|cvc|cvv2|security_code)"\s*:\s*")([^"]+)(")/gi,
      '$1***$3'
    );

    // 3. JSON key "pin", "pin_block", "mpin", "password"
    masked = masked.replace(
      /("(?:pin|pin_block|pinBlock|mpin|password|secret)"\s*:\s*")([^"]+)(")/gi,
      '$1[PIN_MASKED]$3'
    );

    // 4. Masking nomor kartu 16-19 digit standalone dalam string / log raw
    masked = masked.replace(
      /\b(\d{6})(\d{6,9})(\d{4})\b/g,
      (_match, p1, p2, p3) => {
        return `${p1}${'*'.repeat(p2.length)}${p3}`;
      }
    );

    // 5. Masking ISO 8583 BIT 2 & BIT 52
    masked = masked.replace(
      /(BIT2=|\bPAN=)(\d{6})(\d{6,9})(\d{4})([\s|]|$)/gi,
      (_match, p1, p2, p3, p4, p5) => {
        return `${p1}${p2}${'*'.repeat(p3.length)}${p4}${p5}`;
      }
    );

    masked = masked.replace(
      /(BIT52=|PIN_DATA=)([A-Fa-f0-9]{16})([\s|]|$)/gi,
      '$1[PIN_BLOCK_MASKED]$3'
    );

    return masked;
  }

  /**
   * Parser Visual ISO 8583
   */
  static parseIso8583(raw: string): IsoParseResult {
    const fields: IsoBitField[] = [];
    let mti = '0200'; // default Financial Request

    const mtiMatch = raw.match(/MTI\s*[:=]\s*(\d{4})/i) || raw.match(/^(\d{4})/);
    if (mtiMatch) {
      mti = mtiMatch[1];
    }

    // Map bit standar ISO 8583
    const bitDefinitions: Record<number, { name: string; sensitive: boolean }> = {
      2: { name: 'Primary Account Number (PAN)', sensitive: true },
      3: { name: 'Processing Code', sensitive: false },
      4: { name: 'Amount, Transaction', sensitive: false },
      7: { name: 'Transmission Date & Time', sensitive: false },
      11: { name: 'Systems Trace Audit Number (STAN)', sensitive: false },
      12: { name: 'Time, Local Transaction', sensitive: false },
      18: { name: 'Merchant Type', sensitive: false },
      37: { name: 'Retrieval Reference Number (RRN)', sensitive: false },
      39: { name: 'Response Code', sensitive: false },
      48: { name: 'Private Additional Data', sensitive: false },
      52: { name: 'Personal Identification Number (PIN) Block', sensitive: true },
      62: { name: 'Custom Gateway Data', sensitive: false },
    };

    // Regex ekstraksi BITX=value
    const bitRegex = /(?:BIT|DE)\s*(\d{1,3})\s*[:=]\s*([^|\n]+)/gi;
    let match;
    while ((match = bitRegex.exec(raw)) !== null) {
      const bitNum = parseInt(match[1], 10);
      const val = match[2].trim();
      const def = bitDefinitions[bitNum] || { name: `Bit ${bitNum} Field`, sensitive: false };

      fields.push({
        bit: bitNum,
        name: def.name,
        value: val,
        maskedValue: def.sensitive ? Security.maskSensitiveData(val) : val,
        isSensitive: def.sensitive,
      });
    }

    return {
      mti,
      fields,
      raw,
      maskedRaw: Security.maskSensitiveData(raw),
    };
  }

  static formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  }
}
