const db = require("../db")
const partialUpdate = require("../helpers/partialUpdate")


/** Static Job class to handle the db queries in PSQL.  */
class Job {

    /** Returns all the rows of the job table as 
     * an array of  {id, title, equity, company_handle, date_posted}
     */
    static async findAll() {
        const results = await db.query(`SELECT * FROM jobs ORDER BY date_posted DESC`)
        return results.rows
    }

    /** Finds a specific job, based on that job's ID
     * Returns { id, title, equity, company_handle, date_posted }
     */
    static async findById(id) {
        const result = await db.query(`SELECT * FROM jobs WHERE id=$1`, [id])
        return result.rows[0]
    }

    /** Finds all jobs based on the query parameters 
     * Returns an array of { id, title, equity, company_handle, date_posted }
     */
    static async findJobs(data) {
        const { title, min_salary, min_equity } = data
        let baseQuery = `SELECT title, company_handle FROM jobs`

        let whereStatements = []
        let queryValues = []
        let counter = 1

        if (title) {
            whereStatements.push(`title LIKE $${counter}`)
            queryValues.push(title)
            counter++
        }

        if (min_salary) {
            whereStatements.push(`salary> $${counter}`)
            queryValues.push(min_salary)
            counter++
        }

        if (min_equity) {
            whereStatements.push(`equity> $${counter}`)
            queryValues.push(min_equity)
            counter++
        }

        if (whereStatements.length > 0) {
            whereStatements = whereStatements.join(' AND ')
            baseQuery += ' WHERE ' + whereStatements
        }

        const result = await db.query(baseQuery, queryValues)
        return result.rows
    }

    /** Updates the row matching the passed id with an object of key:value pairs
     * @params columnsToUpdate - POJO of column : value pairs, for columns to update and values to update with.
     * Returns the same object as { id, title, equity, company_handle, date_posted }
     */
    static async update(id, columnsToUpdate) {
        let { query, values } = partialUpdate('jobs', columnsToUpdate, 'id', id)

        const result = await db.query(query, values)
        return result.rows[0]
    }

    /** Creates a row and inserts it into the table for jobs
     * Returns  the object inserted as
     * { id, title, equity, company_handle, date_posted }
     */
    static async create(data) {

        const { title, salary, equity, company_handle } = data
        const result = await db.query(
            `INSERT INTO jobs (
                title,
                salary,
                equity,
                company_handle,
                date_posted)
            VALUES ($1, $2, $3, $4, current_timestamp)
            RETURNING *`,
            [title, salary, equity, company_handle]
        )
        return result.rows[0]
    }

    /** Deletes the row in the jobs table based on the id. Returns the entire row deleted.
     * as : { id, title, equity, company_handle, date_posted }
     */
    static async delete(id) {
        const result = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING *`, [id])
        return result.rows[0]
    }
}

module.exports = Job
