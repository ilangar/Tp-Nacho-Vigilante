const cors = require("cors");
const express = require("express");
const app = express();
const mysql = require('mysql2/promise');

app.use(cors());
app.use(express.json());

async function createDBConnection() {
  try {
    const db = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "",
      database: "burgertic"
    });
    return db;
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    throw error;
  }
}

app.get("/menu", async (req, res) => {
  try {
    const db = await createDBConnection();
    const [rows, fields] = await db.execute("SELECT * FROM platos");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el menú desde la base de datos' });
  }
});

app.get("/menu/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const db = await createDBConnection();
    const [rows, fields] = await db.execute("SELECT * FROM platos WHERE id = ?", [id]);
    if (rows.length === 0) {
      res.status(404).json({ msg: "Plato no encontrado" });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el plato desde la base de datos' });
  }
});

app.get("/combos", async (req, res) => {
  try {
    const db = await createDBConnection();
    const [rows, fields] = await db.execute("SELECT * FROM platos WHERE tipo = 'combo'");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los combos desde la base de datos' });
  }
});

app.get("/principales", async (req, res) => {
  try {
    const db = await createDBConnection();
    const [rows, fields] = await db.execute("SELECT * FROM platos WHERE tipo = 'principal'");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los principales desde la base de datos' });
  }
});

app.get("/postres", async (req, res) => {
  try {
    const db = await createDBConnection();
    const [rows, fields] = await db.execute("SELECT * FROM platos WHERE tipo = 'postre'");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los postres desde la base de datos' });
  }
});

app.post("/pedido", async (req, res) => {
  const productos = req.body.productos;

  try {
    const db = await createDBConnection();

    const [result] = await db.execute(
      "INSERT INTO pedidos (id_usuario, fecha, estado) VALUES (?, NOW(), 'pendiente')",
      [1]
    );

    const pedidoId = result.insertId;

    for (const producto of productos) {
      const { id, cantidad } = producto;

      const [platoResult] = await db.execute(
        "SELECT nombre, precio FROM platos WHERE id = ?",
        [id]
      );

      const plato = platoResult[0];

      await db.execute(
        "INSERT INTO pedidos_platos (id_pedido, id_plato, cantidad) VALUES (?, ?, ?)",
        [pedidoId, id, cantidad]
      );
    }

    res.status(201).json({ id: pedidoId });
  } catch (error) {
    console.error("Error al crear el pedido:", error);
    res.status(500).json({ error: 'Error al procesar el pedido' });
  }
});

app.get("/pedidos/:id", async (req, res) => {
  const usuarioId = req.params.id;

  try {
    const db = await createDBConnection();

    const [pedidos] = await db.execute(
      "SELECT p.id AS pedido_id, p.fecha, p.estado, p.id_usuario, pp.id AS plato_id, pl.nombre AS plato_nombre, pl.precio AS plato_precio, pp.cantidad " +
        "FROM pedidos AS p " +
        "JOIN pedidos_platos AS pp ON p.id = pp.id_pedido " +
        "JOIN platos AS pl ON pp.id_plato = pl.id " +
        "WHERE p.id_usuario = ?",
      [usuarioId]
    );

    const formattedPedidos = [];
    let currentPedido = null;

    for (const pedido of pedidos) {
      if (!currentPedido || currentPedido.pedido_id !== pedido.pedido_id) {
        currentPedido = {
          id: pedido.pedido_id,
          fecha: pedido.fecha,
          estado: pedido.estado,
          id_usuario: pedido.id_usuario,
          platos: []
        };
        formattedPedidos.push(currentPedido);
      }

      currentPedido.platos.push({
        id: pedido.plato_id,
        nombre: pedido.plato_nombre,
        precio: pedido.plato_precio,
        cantidad: pedido.cantidad
      });
    }

    res.status(200).json(formattedPedidos);
  } catch (error) {
    console.error("Error al obtener los pedidos:", error);
    res.status(500).json({ error: 'Error al obtener los pedidos' });
  }
});

const PORT = 9000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

app.get("/pedidos/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const db = await createDBConnection();
  
      const [rows, fields] = await db.execute(
        "SELECT p.id, p.fecha, p.estado, p.id_usuario, pp.id_plato, pp.cantidad " +
        "FROM pedidos AS p " +
        "JOIN pedidos_platos AS pp ON p.id = pp.id_pedido " +
        "WHERE p.id_usuario = ?",
        [userId]
      );
  
      const userOrders = {};
  
      for (const row of rows) {
        const { id, fecha, estado, id_usuario, id_plato, cantidad } = row;
  
        if (!userOrders[id]) {
          userOrders[id] = {
            id,
            fecha,
            estado,
            id_usuario,
            platos: []
          };
        }
  
        userOrders[id].platos.push({
          id: id_plato,
          nombre: plato.nombre,
          precio: plato.precio,
          cantidad
        });
      }
  
      const ordersArray = Object.values(userOrders);
  
      res.json(ordersArray);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener los pedidos del usuario' });
    }
  });
  