const { Pool } = require('pg');

// Default credentials used to access into database 
const pool = new Pool({
    user: 'renderer',
    host: 'tileserver', 
    database: 'gis',
    password: 'renderer',
    port: 5432,
});


module.exports = pool; 