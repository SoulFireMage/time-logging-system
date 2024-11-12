const db = require('../db');
const bcrypt = require('bcrypt');

class User {
  static async create(username, password, email) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [username, hashedPassword, email],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, username, email });
          }
        }
      );
    });
  }

  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, username, email FROM users WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async verifyPassword(user, password) {
    return bcrypt.compare(password, user.password);
  }
}

module.exports = User;
