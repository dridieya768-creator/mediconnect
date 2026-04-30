const pg = require('pg');
const client = new pg.Client({
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'aya', database: 'mediconnectt'
});

client.connect(err => {
  if (err) { console.log('Connection error:', err.message); return; }
  
  // Test simple select
  client.query('SELECT COUNT(*) FROM stock_items', (err, res) => {
    if (err) { console.log('stock_items error:', err.message); }
    else { console.log('stock_items count:', res.rows[0].count); }
    
    client.query('SELECT COUNT(*) FROM stock_mouvements', (err2, res2) => {
      if (err2) { console.log('stock_mouvements error:', err2.message); }
      else { console.log('stock_mouvements count:', res2.rows[0].count); }
      client.end();
    });
  });
});
