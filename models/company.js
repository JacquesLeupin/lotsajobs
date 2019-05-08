const db = require("../db")
const partialUpdate = require("../helpers/partialUpdate")

class Company {

    static async findAll(){
        const results = await db.query(`SELECT * FROM companies`)
        return results.rows
    }

    static async delete(handle){
        const result = await db.query(`DELETE FROM companies WHERE handle=$1 RETURNING *`, [handle])
        return result.rows[0] 
    } 

    static async update(handle, columnsToUpdate){
        let {query, values} = partialUpdate('companies', columnsToUpdate, 'handle', handle)

         const result = await db.query(query, values)
         return result.rows[0]
    }
      
    static async findByHandle(handle){
        console.log(handle)
        const result = await db.query(`SELECT * FROM companies WHERE handle=$1`, [handle])
        // console.log(result)
        return result.rows[0]
    }

    static async findCompanies(data){

        const {search, min_employees, max_employees} = data
        let baseQuery = `SELECT handle, name FROM companies`
        let whereStatements = []
        let queryValues = []
        let counter = 1

        if(search){
            whereStatements.push(`name LIKE $${counter}`)
            queryValues.push(search)
            counter++
        }
        if(min_employees){
            whereStatements.push(`num_employees> $${counter}`)
            queryValues.push(min_employees)
            counter++
        }
        if(max_employees){
            whereStatements.push(`num_employees< $${counter}`)
            queryValues.push(max_employees)
            counter++
        }

        if(whereStatements.length > 0){
            whereStatements = whereStatements.join(' AND ')
            console.log(whereStatements)
            baseQuery += ' WHERE ' + whereStatements
            console.log( "^^^^^^^^^^^^^^", baseQuery)

        }

        const dbQuery = await db.query(baseQuery, queryValues)
        return dbQuery.rows
    }

    static async create(data){

        const {handle, name, num_employees, description, logo_url} = data
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