const sqlForPartialUpdate = require("../../helpers/partialUpdate");

describe("sqlForPartialUpdate()", () => {
  it("should generate a proper partial update query with just 1 field",
    function () { 

      let {query, values} = sqlForPartialUpdate('companies', {name: "Jorlando"}, 'handle', 1);

      // FIXME: write real tests!
      expect(query).toEqual("UPDATE companies SET name=$1 WHERE handle=$2 RETURNING *");
      expect(values).toEqual(["Jorlando", 1]);
    });
  it("should generate a proper partial update query with more than one field",
    function () { 

      let {query, values} = sqlForPartialUpdate('companies', {name: "Jorlando", num_employees: 5000}, 'handle', 3);

      // FIXME: write real tests!
      expect(query).toEqual("UPDATE companies SET name=$1, num_employees=$2 WHERE handle=$3 RETURNING *");
      expect(values).toEqual(["Jorlando", 5000, 3]);
    });
});
/**
 * Generate a selective update query based on a request body:
 *
 * - table: where to make the query
 * - items: an object with keys of columns you want to update and values with
 *          updated values
 * 
 * ^^^ above pair for updating proper columns
 * 
 * - key: the column that we query by (e.g. username, handle, id)
 * - id: current record ID
 *
 * 
 * ^^^^^^ above pair for selecting proper row in DB
 * 
 * 
 * Returns object containing a DB query as a string, and array of
 * string values to be updated
 *
 */
