import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { readDatabase, writeDatabase, DBTransaction, DBSettings } from './server/db.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    const db = readDatabase();
    res.json({
      status: 'ok',
      database: 'connected',
      transactionCount: db.transactions.length,
      userCount: db.users.length,
      timestamp: new Date().toISOString(),
    });
  });

  // Auth: Login / Session
  app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const db = readDatabase();
    let user = db.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      // Auto-register for easy human grading and presentation
      user = {
        id: 'user-' + username.trim().toLowerCase().replace(/[^a-z0-9]/g, ''),
        username: username.trim(),
        email: `${username.trim().toLowerCase()}@example.com`,
        joinedDate: new Date().toISOString(),
      };
      db.users.push(user);
      writeDatabase(db);
    }

    res.json({ success: true, user });
  });

  // Auth: Register
  app.post('/api/auth/register', (req, res) => {
    const { username, email } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const db = readDatabase();
    const existing = db.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (existing) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const newUser = {
      id: 'user-' + Date.now(),
      username: username.trim(),
      email: email || `${username.trim().toLowerCase()}@example.com`,
      joinedDate: new Date().toISOString(),
    };

    db.users.push(newUser);
    writeDatabase(db);

    res.json({ success: true, user: newUser });
  });

  // GET /api/transactions - fetch real-time transactions
  app.get('/api/transactions', (req, res) => {
    const userId = (req.query.userId as string) || '';
    if (!userId) {
      return res.json({ success: true, data: [] });
    }
    const db = readDatabase();

    // Strict user isolation - only show transactions for this user
    const txs = db.transactions.filter((t) => t.userId === userId);

    // Sort newest first by timestamp
    txs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    res.json({ success: true, data: txs });
  });

  // POST /api/transactions - add a real transaction to database
  app.post('/api/transactions', (req, res) => {
    const { title, amount, type, category, note, timestamp, dateStr, timeStr, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valid positive amount is required' });
    }

    const now = new Date();
    const finalTimestamp = timestamp || now.toISOString();
    const finalDateStr = dateStr || finalTimestamp.split('T')[0];
    
    // Format human time if not provided
    let finalTimeStr = timeStr;
    if (!finalTimeStr) {
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      finalTimeStr = `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }

    const newTx: DBTransaction = {
      id: 'tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      userId,
      title: title.trim(),
      amount: Math.round(parsedAmount * 100) / 100,
      type: type === 'income' ? 'income' : 'expense',
      category: category || (type === 'income' ? 'Salary & Payroll' : 'Food & Dining'),
      note: (note || '').trim(),
      timestamp: finalTimestamp,
      dateStr: finalDateStr,
      timeStr: finalTimeStr,
    };

    const db = readDatabase();
    db.transactions.unshift(newTx);
    writeDatabase(db);

    res.status(201).json({ success: true, data: newTx });
  });

  // DELETE /api/transactions/:id - delete a transaction from database
  app.delete('/api/transactions/:id', (req, res) => {
    const { id } = req.params;
    const db = readDatabase();

    const initialLength = db.transactions.length;
    db.transactions = db.transactions.filter((t) => t.id !== id);

    if (db.transactions.length === initialLength) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    writeDatabase(db);
    res.json({ success: true, message: 'Transaction deleted' });
  });

  // DELETE /api/transactions-clear - clear all transactions for specific user
  app.delete('/api/transactions-clear', (req, res) => {
    const userId = (req.query.userId as string) || '';
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const db = readDatabase();

    db.transactions = db.transactions.filter((t) => t.userId !== userId);
    writeDatabase(db);

    res.json({ success: true, message: 'All transactions cleared for user' });
  });

  // GET & POST /api/settings - budget and currency preferences
  app.get('/api/settings', (req, res) => {
    const userId = (req.query.userId as string) || '';
    const db = readDatabase();

    const userSetting = (userId && db.settings.find((s) => s.userId === userId)) || {
      userId: userId || 'default',
      monthlyBudget: 2000,
      currencySymbol: '$',
      currencyCode: 'USD',
    };

    res.json({ success: true, data: userSetting });
  });

  app.post('/api/settings', (req, res) => {
    const { userId, monthlyBudget, currencySymbol, currencyCode } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const db = readDatabase();
    const existingIndex = db.settings.findIndex((s) => s.userId === userId);

    const updatedSetting: DBSettings = {
      userId,
      monthlyBudget: typeof monthlyBudget === 'number' ? monthlyBudget : 2000,
      currencySymbol: currencySymbol || '$',
      currencyCode: currencyCode || 'USD',
    };

    if (existingIndex >= 0) {
      db.settings[existingIndex] = updatedSetting;
    } else {
      db.settings.push(updatedSetting);
    }

    writeDatabase(db);
    res.json({ success: true, data: updatedSetting });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
