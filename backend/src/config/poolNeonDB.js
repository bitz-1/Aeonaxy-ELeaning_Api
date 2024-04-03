const { Pool } = require("pg");
const schemaScriptPg = require("../models/schemaPg");
require('dotenv').config();

let {PGHOST,PGDATABASE,PGUSER,PGPASSWORD} = process.env;

const pool = new Pool({
    host:PGHOST,
    database:PGDATABASE,
    username:PGUSER,
    password:PGPASSWORD,
    port:5432,
    ssl:{
        require:true,
    },
});
module.exports = {
    connect: async function () {
        try {
            const client = await pool.connect();
            return client;
        } catch (error) {
            console.error('Error connecting to database:', error);
            throw error;
        }
    }
};
async function createSchema(){
    const client = await pool.connect();
    try{
        const result = await client.query("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users');");
        const tableExists = result.rows[0].exists;
        if (tableExists) {
            console.log('Schema Already Exists');

        }else {
        await client.query(schemaScriptPg);
        console.log('Schema Created successfully');
        }
    }catch(error){
        console.error('Error creating the schema');
    }finally {
        client.release();
    }
}
createSchema();


async function getPg(){
    const client = await pool.connect();
    try{
        const result = await client.query('SELECT version ()');
        console.log("database connected",result.rows[0]);
    } finally {
        client.release();
    }
}
getPg();