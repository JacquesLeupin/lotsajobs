const db = require("../db")
const partialUpdate = require("../helpers/partialUpdate")

class Company {

    // function sqlForPartialUpdate(table, items, key, id) {
    //     // keep track of item indexes
    //     // store all the columns we want to update and associate with vals
      
    //     let idx = 1
    //     let columns = []
      
    //     // filter out keys that start with "_" -- we don't want these in DB
    //     for (let key in items) {
    //       if (key.startsWith("_")) {
    //         delete items[key]
    //       }
    //     }
      
    //     for (let column in items) {
    //       columns.push(`${column}=$${idx}`)
    //       idx += 1
    //     }
      
    //     // build query
    //     let cols = columns.join(", ")
    //     let query = `UPDATE ${table} SET ${cols} WHERE ${key}=$${idx} RETURNING *`
      
    //     let values = Object.values(items)
    //     values.push(id)
      
    //     return { query, values }
    //   }
      
    //   module.exports = sqlForPartialUpdate

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
        console.log(columnsToUpdate, "columns 2 update", query, values)

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