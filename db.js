const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Create a new database connection
const db = new sqlite3.Database('./timelogging.sqlite', (err) => {
    if (err) {
        console.error('Error opening database', err);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Function to initialize the database
function initializeDatabase() {
    const sqlScript = fs.readFileSync(path.join(__dirname, 'database_setup.sql'), 'utf8');
    
    db.exec(sqlScript, (err) => {
        if (err) {
            console.error('Error initializing database', err);
        } else {
            console.log('Database initialized successfully.');
            // After initialization, log the table names
            logTableNames();
        }
    });
}

// Function to log table names
function logTableNames() {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
        if (err) {
            console.error('Error getting table names:', err);
        } else {
            console.log('Tables in the database:');
            tables.forEach(table => {
                console.log(table.name);
            });
        }
    });
}

// Initialize the database
initializeDatabase();

module.exports = db;
