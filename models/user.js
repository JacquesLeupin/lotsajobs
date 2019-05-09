const db = require("../db")
const partialUpdate = require("../helpers/partialUpdate")

class User {

    static async create(data) {

        const { username, password, first_name, last_name, email, photo_url } = data
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
        )
        return result.rows[0]
    }

    static async findAll (){
        const results = await db.query(`SELECT * FROM users`)
        return results.rows
    }

}

module.exports = User