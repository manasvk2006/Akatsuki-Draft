const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.json({ success: true, message: 'akatsuki draft is running on localhost' });
  }
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Akatsuki Draft</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #0f172a;
      color: #f8fafc;
    }
    .card {
      text-align: center;
      padding: 2.5rem 3.5rem;
      background: #1e293b;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
      border: 1px solid #334155;
    }
    h1 {
      font-size: 2.2rem;
      margin: 0 0 0.5rem;
      color: #38bdf8;
    }
    p {
      color: #94a3b8;
      font-size: 1.1rem;
      margin: 0 0 1.25rem;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.4rem 1rem;
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 9999px;
      font-weight: 500;
      font-size: 0.95rem;
    }
    .dot {
      width: 8px;
      height: 8px;
      background: #22c55e;
      border-radius: 50%;
      box-shadow: 0 0 8px #22c55e;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>akatsuki draft is running on localhost</h1>
    <p>AI-Enabled Content Sharing Platform API</p>
    <div class="status"><span class="dot"></span> Online on Port 3000</div>
  </div>
</body>
</html>`);
});

app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/admin', adminRoutes);
app.use('/ai', aiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
