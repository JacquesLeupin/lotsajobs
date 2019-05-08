const db = require("../db")
const partialUpdate = require("../helpers/partialUpdate")

class Job {
    
    static async findAll (){
        const results = await db.query(`SELECT * FROM jobs ORDER BY date_posted DESC`)
        return results.rows
    }
    static async findById(id) {
        const result = await db.query(`SELECT * FROM jobs WHERE id=$1`, [id])
        return result.rows[0]
    }

    static async findJobs(data){
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

    static async update(id, columnsToUpdate) {
        let { query, values } = partialUpdate('jobs', columnsToUpdate, 'id', id)

        const result = await db.query(query, values)
        return result.rows[0]
    }

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

    static async delete(id) {
        const result = await db.query(`DELETE FROM jobs WHERE id=$1 RETURNING *`, [id])
        return result.rows[0]
    }
}

module.exports = Job
