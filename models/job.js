const db = require("../db")

class Job {
    
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
}

module.exports = Job
