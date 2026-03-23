const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, database:'mediconnectt', user:'postgres', password:'aya' });
c.connect()
  .then(() => c.query(`
    SELECT first_name, last_name, role, status 
    FROM users 
    WHERE role IN ('MEDECIN_GENERALISTE','MEDECIN_SPECIALISTE') 
    LIMIT 10
  `))
  .then(r => { 
    console.log('Médecins trouvés:', r.rows.length);
    r.rows.forEach(row => console.log(` - ${row.first_name} ${row.last_name} | ${row.role} | status: ${row.status}`));
    c.end(); 
  })
  .catch(err => { console.error('Erreur:', err.message); c.end(); });