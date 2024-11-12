const db = require('../db');

class Task {
  static async create(userId, title, description, dueDate) {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO tasks (user_id, title, description, due_date) VALUES (?, ?, ?, ?)',
        [userId, title, description, dueDate],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, userId, title, description, dueDate });
          }
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM tasks WHERE user_id = ?', [userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async update(id, title, description, dueDate) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE tasks SET title = ?, description = ?, due_date = ? WHERE id = ?',
        [title, description, dueDate, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, title, description, dueDate });
          }
        }
      );
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM tasks WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id });
        }
      });
    });
  }
}

module.exports = Task;
