const { Client } = require('pg');
const c = new Client({ host:'localhost', port:5432, user:'postgres', password:'aya', database:'mediconnectt' });
c.connect().then(() => c.query(
  "SELECT id, documents FROM patients WHERE user_id = '2fcedf0d-5a51-4531-b6f8-5e2896cc45a4'"
)).then(r => {
  console.log(JSON.stringify(r.rows[0], null, 2));
  c.end();
}).catch(e => { console.error(e.message); c.end(); });
