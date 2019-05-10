const db = require("../db");
const partialUpdate = require("../helpers/partialUpdate");

/** Static company class to handle the db queries in PSQL.  */
class Company {

  /** Returns all the rows of the company table as 
     * an array of  {handle, name, num_employees, description, logo_url }
     */
  static async findAll() {
    const results = await db.query(`SELECT * FROM companies`);
    return results.rows;
  }

  /** Deletes the row in the db based on the handle name. Returns the entire row deleted.
     * as : {handle, name, num_employees, description, logo_url }
     */
  static async delete(handle) {
    const result = await db.query(`DELETE FROM companies WHERE handle=$1 RETURNING *`, [handle]);
    return result.rows[0];
  }

  /** Updates the row matching the handle with an object of key:value pairs
     * @params columnsToUpdate - POJO of column : value pairs, for columns to update and values to update with.
     * Returns the same object as {handle, name, num_employees, description, logo_url }
    */
  static async update(handle, columnsToUpdate) {
    let { query, values } = partialUpdate('companies', columnsToUpdate, 'handle', handle);

    const result = await db.query(query, values);
    return result.rows[0];
  }

  /** Returns the single row of the company object :
     * {handle, name, num_employees, description, logo_url }
     */
  static async findByHandle(handle) {
    const result = await db.query(  
      `SELECT handle, name, num_employees, description, logo_url FROM companies 
                WHERE handle=$1`, [handle]);
    return result.rows[0];
  }

  /** Returns a list of all the jobs that belong to a company */
  static async findAllJobsFromCompanyHandle(handle) {
    const result = await db.query(  
      `SELECT jobs.title, jobs.salary, jobs.equity FROM jobs
                JOIN companies ON companies.handle = jobs.company_handle 
                WHERE companies.handle=$1` 
      , [handle]);
    return result.rows;
  }


  static async findCompanies(data) {

    const { search, min_employees, max_employees } = data;
    let baseQuery = `SELECT handle, name FROM companies`;
        
    // Holds all the conditionals in an array 
    let whereStatements = []; // Array of ["name LIKE $1",  "num_employees > $2", "num_employees < $1"]
    let queryValues = []; // queryValues that correspond to the $1, $2, $3
        
    let counter = 1; // Counter keeps track of the $1.. $2.

    // prefixes for find companies
    let wherePrefixes = ["name LIKE ", "num_employees >", "num_employees <"];

    // each loop appends .., "name LIKE $1",  "num_employees > $2", etc. if they exist
    for (let [idx, value] of [search, min_employees, max_employees].entries()) {
      if (value) {
        whereStatements.push(`${wherePrefixes[idx]}$${counter}`);
        queryValues.push(value);
        counter++; 
      }
    }

    // Build the base query based off the whereStatements, if they provided any
    if (whereStatements.length > 0) {
      baseQuery += ' WHERE ' +  whereStatements.join(' AND ');
    }

    const result = await db.query(baseQuery, queryValues);
    return result.rows;
  }

  /** Creates a row and inserts it into the db
     * Returns {handle, name, num_employees, description, logo_url }
     */
  static async create(data) {

    const { handle, name, num_employees, description, logo_url } = data;
    const result = await db.query(
      `INSERT INTO companies (
                handle,
                name,
                num_employees,
                description,
                logo_url)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
      [handle, name, num_employees, description, logo_url]
    );
    return result.rows[0];
  }
}


module.exports = Company;