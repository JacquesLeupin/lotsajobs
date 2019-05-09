const db = require("../db");
const partialUpdate = require("../helpers/partialUpdate");

class User {

  static async create(data) {

    const { username, password, first_name, last_name, email, photo_url } = data;
    const result = await db.query(
      `INSERT INTO users (
                username,
                password,
                first_name,
                last_name,
                email,
                photo_url)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
      [username, password, first_name, last_name, email, photo_url]
    );
    return result.rows[0];
  }

  static async findAll() {
    const results = await db.query(`SELECT * FROM users`);
    return results.rows;
  }

  static async authenticate (username, password){
    const result = await db.query(`SELECT * FROM USERS WHERE USERNAME = $1 AND PASSWORD = $2`, [username, password]);
    return result.rows;
  }

  static async findByUsername(username) {
    const result = await db.query(`SELECT * FROM users WHERE username=$1`, [username]);
    return result.rows[0];
  }

  static async update(username, columnsToUpdate) {
    let { query, values } = partialUpdate('users', columnsToUpdate, 'username', username);

    const result = await db.query(query, values);
    return result.rows[0];
  }

  static async delete(username) {
    const result = await db.query(`DELETE FROM users WHERE username=$1 RETURNING *`, [username]);
    return result.rows[0];
  }

}

module.exports = User;