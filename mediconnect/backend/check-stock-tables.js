const pg = require('pg');
const client = new pg.Client({
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'aya', database: 'mediconnectt'
});

client.connect(err => {
  if (err) { console.log('Connection error:', err.message); return; }
  
  client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('stock_items', 'stock_mouvements')",
    (err, res) => {
      if (err) { console.log('Query error:', err.message); }
      else { console.log('Tables found:', JSON.stringify(res.rows)); }
      client.end();
    }
  );
});
