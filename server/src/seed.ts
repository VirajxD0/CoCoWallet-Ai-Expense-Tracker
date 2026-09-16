/**
 * Re-seed script — wipes + reseeds budgets & expenses for deshmukhviraj654@gmail.com.
 * Run: cd server && npx ts-node src/seed.ts
 */
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const TARGET_EMAIL = 'deshmukhviraj654@gmail.com';

const BUDGETS = [
  { category: 'Food & Dining', monthly_limit: 8000, month: '2026-09' },
  { category: 'Transport', monthly_limit: 3000, month: '2026-09' },
  { category: 'Shopping', monthly_limit: 5000, month: '2026-09' },
  { category: 'Entertainment', monthly_limit: 2000, month: '2026-09' },
  { category: 'Bills & Utilities', monthly_limit: 6000, month: '2026-09' },
  { category: 'Health', monthly_limit: 3000, month: '2026-09' },
];

const EXPENSES = [
  // Food & Dining
  { amount: 320, description: 'Lunch at office cafeteria', category: 'Food & Dining', date: '2026-09-01' },
  { amount: 185, description: 'Morning coffee and pastry', category: 'Food & Dining', date: '2026-09-02' },
  { amount: 2400, description: 'Grocery shopping at BigBasket', category: 'Food & Dining', date: '2026-09-03' },
  { amount: 450, description: "Dinner at Domino's", category: 'Food & Dining', date: '2026-09-05' },
  { amount: 680, description: 'Weekend brunch with friends', category: 'Food & Dining', date: '2026-09-07' },
  // Transport
  { amount: 120, description: 'Auto fare to station', category: 'Transport', date: '2026-09-01' },
  { amount: 350, description: 'Uber ride to office', category: 'Transport', date: '2026-09-04' },
  { amount: 800, description: 'Petrol fill-up', category: 'Transport', date: '2026-09-06' },
  { amount: 150, description: 'Metro card recharge', category: 'Transport', date: '2026-09-08' },
  // Shopping
  { amount: 1299, description: 'New headphones from Flipkart', category: 'Shopping', date: '2026-09-02' },
  { amount: 499, description: 'T-shirt from Myntra', category: 'Shopping', date: '2026-09-05' },
  { amount: 2100, description: 'Running shoes from Decathlon', category: 'Shopping', date: '2026-09-09' },
  // Entertainment
  { amount: 499, description: 'Netflix subscription', category: 'Entertainment', date: '2026-09-01' },
  { amount: 350, description: 'Movie tickets - PVR', category: 'Entertainment', date: '2026-09-07' },
  { amount: 250, description: 'Spotify premium', category: 'Entertainment', date: '2026-09-10' },
  // Bills & Utilities
  { amount: 2100, description: 'Electricity bill', category: 'Bills & Utilities', date: '2026-09-03' },
  { amount: 850, description: 'Internet bill - Airtel', category: 'Bills & Utilities', date: '2026-09-04' },
  { amount: 1200, description: 'Mobile recharge - Jio', category: 'Bills & Utilities', date: '2026-09-06' },
  { amount: 600, description: 'Water bill', category: 'Bills & Utilities', date: '2026-09-08' },
  // Health
  { amount: 500, description: 'Doctor visit co-pay', category: 'Health', date: '2026-09-02' },
  { amount: 750, description: 'Pharmacy - medicines', category: 'Health', date: '2026-09-05' },
  { amount: 1500, description: 'Gym monthly membership', category: 'Health', date: '2026-09-01' },
];

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 15000,
  });

  console.log('🔗 Connected to database');

  // Find target user
  const [users] = await pool.query('SELECT id, email FROM users WHERE email = ?', [TARGET_EMAIL]) as any[];
  if (!users.length) {
    console.log(`❌ User ${TARGET_EMAIL} not found.`);
    process.exit(1);
  }
  const userId = users[0].id;
  console.log(`👤 User: ${users[0].email} (${userId})`);

  // Delete existing budgets + expenses
  console.log('\n🗑️  Deleting existing budgets...');
  const [budgetDel] = await pool.query('DELETE FROM budgets WHERE user_id = ?', [userId]) as any[];
  console.log(`   Deleted ${budgetDel.affectedRows} budget(s)`);

  console.log('🗑️  Deleting existing expenses...');
  const [expenseDel] = await pool.query('DELETE FROM expenses WHERE user_id = ?', [userId]) as any[];
  console.log(`   Deleted ${expenseDel.affectedRows} expense(s)`);

  // Insert fresh budgets
  console.log('\n📁 Inserting budgets...');
  for (const b of BUDGETS) {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO budgets (id, user_id, category, monthly_limit, month) VALUES (?, ?, ?, ?, ?)',
      [id, userId, b.category, b.monthly_limit, b.month]
    );
    console.log(`   ✓ ${b.category} — ₹${b.monthly_limit}/mo`);
  }

  // Insert fresh expenses
  console.log('\n💰 Inserting expenses...');
  let inserted = 0;
  for (const e of EXPENSES) {
    const id = uuidv4();
    await pool.query(
      'INSERT INTO expenses (id, user_id, amount, description, category, date) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, e.amount, e.description, e.category, e.date]
    );
    inserted++;
  }
  console.log(`   ✅ ${inserted} expenses inserted`);

  await pool.end();
  console.log('\n🎉 Done!');
}

seed().catch(e => { console.error('❌ Seed failed:', e); process.exit(1) });
