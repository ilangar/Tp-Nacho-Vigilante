const mysql = require('mysql2/promise');
const fs = require('fs');
const menu = require('./menu.json');

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "burgertic"
})


const menuData = JSON.parse(fs.readFileSync('menu.json'));

async function insertMenuData() {
  try {
    const db = await connection;
    for (const item of menuData) {
      const { id, tipo, nombre, precio, descripcion } = item;
      const sql = `INSERT INTO platos (id, tipo, nombre, precio, descripcion) VALUES (?, ?, ?, ?, ?)`;
      await db.query(sql, [id, tipo, nombre, precio, descripcion]);
    }
    console.log('Datos del menú insertados en la base de datos.');
  } catch (error) {
    console.error('Error al insertar datos en la base de datos:', error);
  } finally {
    connection.end(); 
}
}

insertMenuData();