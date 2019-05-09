const db = require("../db")
const partialUpdate = require("../helpers/partialUpdate")

/** Static company class to handle the db queries in PSQL.  */
class Company {

    /** Returns all the rows of the company table as 
     * an array of  {handle, name, num_employees, description, logo_url }
     */
    static async findAll() {
        const results = await db.query(`SELECT * FROM companies`)
        return results.rows
    }

    /** Deletes the row in the db based on the handle name. Returns the entire row deleted.
     * as : {handle, name, num_employees, description, logo_url }
     */
    static async delete(handle) {
        const result = await db.query(`DELETE FROM companies WHERE handle=$1 RETURNING *`, [handle])
        return result.rows[0]
    }

    /** Updates the row matching the handle with an object of key:value pairs
     * @params columnsToUpdate - POJO of column : value pairs, for columns to update and values to update with.
     * Returns the same object as {handle, name, num_employees, description, logo_url }
    */
    static async update(handle, columnsToUpdate) {
        let { query, values } = partialUpdate('companies', columnsToUpdate, 'handle', handle)

        const result = await db.query(query, values)
        return result.rows[0]
    }

    /** Returns the single row of the company object :
     * {handle, name, num_employees, description, logo_url }
     */
    static async findByHandle(handle) {
        const result = await db.query(  
            `SELECT * FROM companies 
                WHERE handle=$1`, [handle])
        return result.rows[0]
    }

    /** Returns a list of all the jobs that belong to a company */
    static async findAllJobsFromCompanyHandle(handle) {
        const result = await db.query(  
            `SELECT jobs.title, jobs.salary, jobs.equity FROM jobs
                JOIN companies ON companies.handle = jobs.company_handle 
                WHERE companies.handle=$1` 
                , [handle])
        return result.rows;
    }




    static async findCompanies(data) {

        const { search, min_employees, max_employees } = data
        let baseQuery = `SELECT handle, name FROM companies`
        
        // Holds all the conditionals in an array 
        let whereStatements = []
        
        // Holds all the queryValues to be passed in. ($1, $2, $3, $4... etc)
        let queryValues = []
        
        // Counter keeps track of the $1.. $2.
        let counter = 1

        if (search) {
            whereStatements.push(`name LIKE $${counter}`)
            queryValues.push(search)
            counter++
        }

        if (min_employees) {
            whereStatements.push(`num_employees> $${counter}`)
            queryValues.push(min_employees)
            counter++
        }

        if (max_employees) {
            whereStatements.push(`num_employees< $${counter}`)
            queryValues.push(max_employees)
            counter++
        }

        // Build the base query based off the whereStatements
        if (whereStatements.length > 0) {
            whereStatements = whereStatements.join(' AND ')
            baseQuery += ' WHERE ' + whereStatements
        }
        const result = await db.query(baseQuery, queryValues)
        return result.rows
    }

    /** Creates a row and inserts it into the db
     * Returns {handle, name, num_employees, description, logo_url }
     */
    static async create(data) {

        const { handle, name, num_employees, description, logo_url } = data
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
        )
        return result.rows[0]
    }
}


module.exports = Company