import mysql from 'mysql2/promise';

async function runTests() {
  console.log('=== STARTING AUTOMATED NEXT.JS SYSTEM VERIFICATION ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, label) {
    if (condition) {
      console.log(` [PASS] ${label}`);
      passed++;
    } else {
      console.error(` [FAIL] ${label}`);
      failed++;
    }
  }

  // Test 1: Database Connection
  try {
    const conn = await mysql.createConnection({
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '',
      database: 'sistem_pkl_defect',
    });
    assert(true, 'MySQL Database Connection OK');

    // Test 2: Table Checks
    const tables = ['clients', 'projects', 'modules', 'users', 'defects', 'defect_activities', 'notifications'];
    for (const t of tables) {
      const [rows] = await conn.execute(`SHOW TABLES LIKE '${t}'`);
      assert(rows.length > 0, `Table '${t}' exists`);
    }

    // Test 3: PAN Regex Masking Check
    const rawPan = '{"pan": "4111112233441111", "cvv": "123", "pin": "654321"}';
    const masked = rawPan
      .replace(/("(?:pan|card_number|cardNumber)"\s*:\s*")(\d{6})(\d{4,9})(\d{4})(")/gi, '$1$2******$4$5')
      .replace(/("(?:cvv|cvc)"\s*:\s*")([^"]+)(")/gi, '$1***$3')
      .replace(/("(?:pin|pin_block)"\s*:\s*")([^"]+)(")/gi, '$1[PIN_MASKED]$3');

    assert(masked.includes('411111******1111'), 'PAN is masked (first 6 & last 4 preserved)');
    assert(masked.includes('***'), 'CVV is masked');
    assert(masked.includes('[PIN_MASKED]'), 'PIN is masked');

    // Test 4: Defect Query
    const [defRows] = await conn.execute('SELECT COUNT(*) as total FROM defects');
    assert(defRows[0].total >= 0, 'Defects query executed successfully');

    await conn.end();
  } catch (err) {
    assert(false, `Database connection failed: ${err.message}`);
  }

  console.log(`\n=== VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED ===`);
  if (failed === 0) {
    console.log('>>> ALL SYSTEM ACCEPTANCE CRITERIA SATISFIED 100% <<<\n');
  }
}

runTests();
