const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, database:'mediconnectt', user:'postgres', password:'aya' });
c.connect()
  .then(() => c.query("SELECT unnest(enum_range(NULL::user_role))::text as role"))
  .then(r => { 
    console.log('Rôles dans la DB:');
    r.rows.forEach(row => console.log(' -', row.role));
    c.end(); 
  })
  .catch(err => {
    console.error('Erreur:', err.message);
    c.end();
  });