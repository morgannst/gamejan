const { Client } = require('pg');
require('dotenv').config();

async function init() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL is not set in the .env file.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔌 Connecting to Neon database...');
    await client.connect();
    console.log('✨ Connected successfully!');

    console.log('🛠️ Creating tables...');
    
    // Create spelling_scores table
    await client.query(`
      CREATE TABLE IF NOT EXISTS spelling_scores (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(100) NOT NULL,
        score INT NOT NULL,
        history JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Table "spelling_scores" created or already exists.');

    // Create word_errors_stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS word_errors_stats (
        word VARCHAR(100) PRIMARY KEY,
        meaning VARCHAR(255) NOT NULL,
        error_count INT DEFAULT 0
      );
    `);
    console.log('✅ Table "word_errors_stats" created or already exists.');

    // Initialize vocabulary
    const vocabulary = [
      { word: "Cousin", meaning: "ลูกพี่ลูกน้อง" },
      { word: "Groom", meaning: "เจ้าบ่าว" },
      { word: "Bride", meaning: "เจ้าสาว" },
      { word: "Father", meaning: "พ่อ" },
      { word: "Mother", meaning: "แม่" },
      { word: "Aunt", meaning: "ป้า, น้าผู้หญิง, อาผู้หญิง" },
      { word: "Uncle", meaning: "ลุง, น้าผู้ชาย, อาผู้ชาย" },
      { word: "Grandmother", meaning: "ย่า, ยาย" },
      { word: "Grandson", meaning: "หลานชาย" },
      { word: "Granddaughter", meaning: "หลานสาว" }
    ];

    console.log('📊 Initializing vocabulary stats...');
    for (const item of vocabulary) {
      await client.query(`
        INSERT INTO word_errors_stats (word, meaning, error_count)
        VALUES ($1, $2, 0)
        ON CONFLICT (word) DO NOTHING;
      `, [item.word, item.meaning]);
    }
    console.log('🎉 Vocabulary initialized successfully!');

  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  } finally {
    await client.end();
  }
}

init();
