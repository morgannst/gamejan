/**
 * ====================================================================
 * SPELLING TEST BACKEND SERVER (Node.js + Express + PostgreSQL)
 * ====================================================================
 * เซิร์ฟเวอร์หลังบ้านสำหรับระบบเกมสะกดคำภาษาอังกฤษเด็ก ป.3
 * ทำหน้าที่เชื่อมต่อกับฐานข้อมูล Neon.com คลาวด์อย่างปลอดภัย
 */

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config(); // โหลดค่าติดตั้งความปลอดภัยจากไฟล์ .env

const app = express();
const PORT = process.env.PORT || 3000;

// ปลดล็อก CORS เพื่อให้หน้าเว็บ (Frontend) ที่อยู่คนละโดเมนสามารถเชื่อมต่อได้
app.use(cors());
app.use(express.json());

// ตรวจสอบค่า DATABASE_URL ในระบบความปลอดภัยเพื่อป้องกันเซิร์ฟเวอร์ดับ
if (!process.env.DATABASE_URL) {
    console.error('❌ ข้อผิดพลาด: ไม่พบตัวแปร DATABASE_URL ใน Environment Variable!');
}

// ตั้งค่าระบบ Pooling เชื่อมโยงฐานข้อมูล Neon.com (PostgreSQL)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // จำเป็นสำหรับการเชื่อมต่อบนระบบ Cloud ที่มีความปลอดภัยสูง (SSL)
    }
});

// ตรวจสอบการเชื่อมต่อกับฐานข้อมูลคลาวด์ครั้งแรก
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ ไม่สามารถเชื่อมต่อกับฐานข้อมูล Neon.com ได้:', err.stack);
    }
    console.log('✨ เชื่อมต่อกับฐานข้อมูล Neon.com สำเร็จแล้ว!');
    release();
});

/**
 * --------------------------------------------------------------------
 * API ENDPOINT: ดึงข้อมูลตารางอันดับคะแนนคนเก่ง (Top 10 Leaderboard)
 * --------------------------------------------------------------------
 */
app.get('/api/leaderboard', async (req, res) => {
    try {
        const queryText = `
            SELECT 
                player_name, 
                score, 
                TO_CHAR(created_at + INTERVAL '7 hours', 'DD/MM/YYYY HH24:MI') as date
            FROM spelling_scores
            ORDER BY score DESC, created_at ASC
            LIMIT 10;
        `;
        const result = await pool.query(queryText);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลอันดับคะแนนได้' });
    }
});

/**
 * --------------------------------------------------------------------
 * API ENDPOINT: บันทึกคะแนน และอัปเดตสถิติคำศัพท์สะกดผิด
 * --------------------------------------------------------------------
 */
app.post('/api/scores', async (req, res) => {
    const { player_name, score, history } = req.body;

    // ตรวจสอบข้อมูลความถูกต้องเบื้องต้นก่อนทำการบันทึกข้อมูล
    if (!player_name || score === undefined || !history) {
        return res.status(400).json({ error: 'ข้อมูลที่ส่งมาไม่ครบถ้วน' });
    }

    const client = await pool.connect();
    try {
        // ใช้ระบบ Transaction ของฐานข้อมูลในการทำงาน เพื่อความมั่นใจว่าถ้ามีคำสั่งใดเกิดข้อผิดพลาด ข้อมูลทั้งหมดจะไม่เสียหาย
        await client.query('BEGIN');

        // 1. บันทึกคะแนนของเด็กๆ ลงตารางหลัก
        const insertScoreQuery = `
            INSERT INTO spelling_scores (player_name, score, history)
            VALUES ($1, $2, $3)
            RETURNING id;
        `;
        await client.query(insertScoreQuery, [player_name, score, JSON.stringify(history)]);

        // 2. ตรวจสอบประวัติการสอบทีละข้อ เพื่อดูว่าสะกดข้อไหนผิด และนำไปเพิ่มในสถิติวิเคราะห์จุดอ่อนเด็ก ป.3
        for (const record of history) {
            if (record.isCorrect === false) {
                const updateErrorQuery = `
                    UPDATE word_errors_stats
                    SET error_count = error_count + 1
                    WHERE LOWER(word) = LOWER($1);
                `;
                await client.query(updateErrorQuery, [record.word]);
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'บันทึกคะแนนและสถิติสะกดผิดสำเร็จแล้ว!' });
    } catch (err) {
        await client.query('ROLLBACK'); // ย้อนกลับคำสั่งทั้งหมดหากเกิดข้อผิดพลาดระหว่างรันคำสั่ง
        console.error('Error saving score:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์ขณะบันทึกข้อมูล' });
    } finally {
        client.release(); // คืนทรัพยากรการเชื่อมต่อกลับคืนระบบ
    }
});

/**
 * --------------------------------------------------------------------
 * API ENDPOINT: ดึงข้อมูลตารางอันดับคะแนน (Religion Game)
 * --------------------------------------------------------------------
 */
app.get('/api/religion-leaderboard', async (req, res) => {
    try {
        const { mode } = req.query; // 'trivia' or 'sorting'
        const queryText = `
            SELECT 
                player_name, 
                score, 
                TO_CHAR(created_at + INTERVAL '7 hours', 'DD/MM/YYYY HH24:MI') as date
            FROM religion_scores
            WHERE mode = $1
            ORDER BY score DESC, created_at ASC
            LIMIT 10;
        `;
        const result = await pool.query(queryText, [mode]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching religion leaderboard:', err);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลอันดับคะแนนได้' });
    }
});

/**
 * --------------------------------------------------------------------
 * API ENDPOINT: บันทึกคะแนน และสถิติ (Religion Game)
 * --------------------------------------------------------------------
 */
app.post('/api/religion-scores', async (req, res) => {
    const { player_name, mode, score, history } = req.body;

    if (!player_name || !mode || score === undefined || !history) {
        return res.status(400).json({ error: 'ข้อมูลที่ส่งมาไม่ครบถ้วน' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. บันทึกคะแนน
        const insertScoreQuery = `
            INSERT INTO religion_scores (player_name, mode, score, history)
            VALUES ($1, $2, $3, $4)
            RETURNING id;
        `;
        await client.query(insertScoreQuery, [player_name, mode, score, JSON.stringify(history)]);

        // 2. อัปเดตสถิติข้อที่ผิด (upsert)
        for (const record of history) {
            if (record.isCorrect === false) {
                const item_name = record.item_name || record.question || 'Unknown';
                const updateErrorQuery = `
                    INSERT INTO religion_errors_stats (item_name, mode, error_count)
                    VALUES ($1, $2, 1)
                    ON CONFLICT (item_name) DO UPDATE 
                    SET error_count = religion_errors_stats.error_count + 1;
                `;
                await client.query(updateErrorQuery, [item_name, mode]);
            }
        }

        await client.query('COMMIT');
        res.json({ success: true, message: 'บันทึกคะแนนเกมศาสนาสำเร็จแล้ว!' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error saving religion score:', err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดภายในระบบเซิร์ฟเวอร์ขณะบันทึกข้อมูล' });
    } finally {
        client.release();
    }
});

/**
 * --------------------------------------------------------------------
 * API ENDPOINT: ดึงสถิติคำสะกดผิดยอดฮิตของคุณครู (สำหรับคุณครูวิเคราะห์วิชาการ)
 * --------------------------------------------------------------------
 */
app.get('/api/teacher/error-analysis', async (req, res) => {
    try {
        const queryText = `
            SELECT word, meaning, error_count 
            FROM word_errors_stats 
            ORDER BY error_count DESC;
        `;
        const result = await pool.query(queryText);
        res.json(result.rows);
    } catch (err) {
        console.error('Error database stats query:', err);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถิติหลังบ้านได้' });
    }
});

// เปิดรันตัวแอปพลิเคชันผ่านพอร์ตที่กำหนด (จะทำงานเฉพาะตอนรันเครื่องตัวเอง หรือระบบที่ไม่ใช่ Serverless Vercel)
if (process.env.NODE_ENV !== 'production' && require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 เซิร์ฟเวอร์หลังบ้านเริ่มต้นทำงานที่พอร์ต http://localhost:${PORT}`);
    });
}

module.exports = app;
