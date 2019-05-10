const db = require("../db");
const partialUpdate = require("../helpers/partialUpdate");
const bcrypt = require("bcrypt");

/** Static User class to handle the db queries in PSQL.  */
class User {

  /** Creates a row and inserts it into the table for Users **/
  static async create(data) {

    const { username, password, first_name, last_name, email, photo_url } = data;
    const hashedPassword = await bcrypt.hash(password, 12);
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
      [username, hashedPassword, first_name, last_name, email, photo_url]
    );
    return result.rows[0];
  }

  /** Returns all the rows of the user table as 
     * an array of  {username, password, first_name, last_name, email, photo_url, and is_admin}
     */
  static async findAll() {
    const results = await db.query(`SELECT * FROM users`);
    return results.rows;
  }

  /** Returns the row from the user table as **/
  static async authenticate (username, password){

    // grabbing user from db based off of username
    const result = await db.query(`SELECT * FROM USERS WHERE USERNAME = $1`, [username]);

    const user = result.rows[0];

    // check if provided user password matches hashed password in db
    const isValid = await bcrypt.compare(password, user.password)
    if(isValid){
      return user;
    }
    else{
      return false;
    }
  }

  /* Returns a user object when passed a username */
  static async findByUsername(username) {
    const result = await db.query(`SELECT * FROM users WHERE username=$1`, [username]);
    return result.rows[0];
  }

  /* Small helper function to chekc if a user exists in a table */
  static async alreadyExists(username, email){
    const result = await db.query(`SELECT * FROM users WHERE username=$1 AND email=$2`, [username, email]);
    return result.rows[0];
  }

  /** Updates the row matching the passed username with an object of key:value pairs
     * @params columnsToUpdate - POJO of column : value pairs, for columns to update and values to update with.
     */
  static async update(username, columnsToUpdate) {
    let { query, values } = partialUpdate('users', columnsToUpdate, 'username', username);

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /** Deletes a specifc user from the database based on username **/
  static async delete(username) {
    const result = await db.query(`DELETE FROM users WHERE username=$1 RETURNING *`, [username]);
    return result.rows[0];
  }

}

module.exports = User;

