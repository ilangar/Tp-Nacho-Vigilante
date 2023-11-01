const cors = require("cors");
const express = require("express");
const app = express();
const menu = require('./menu.json');

app.use(cors());
app.use(express());
app.use(express.json());

app.get("/menu", (req, res) => {
    res.json(menu);
});

app.get("/menu/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const plato = menu.find(item => item.id === id);

    if (!plato) {
        res.status(404).json({ msg: "Plato no encontrado" });
    } else {
        res.json(plato);
    }
});

app.get("/combos", (req, res) => {
    const combos = menu.filter(item => item.tipo === "combo");
    res.json(combos);
});

app.get("/principales", (req, res) => {
    const principales = menu.filter(item => item.tipo === "principal");
    res.json(principales);
});

app.get("/postres", (req, res) => {
    const postres = menu.filter(item => item.tipo === "postre");
    res.json(postres);
});

app.post("/pedido", (req, res) => {
    const productos = req.body.productos;
    let precioTotal = 0;

    for (const producto of productos) {
        const plato = menu.find(item => item.id === parseInt(producto.id));

        if (!plato) {
            res.status(400).json({ msg: `Plato con ID ${producto.id} no encontrado` });
            return;
        }

        precioTotal += parseInt(plato.precio) * parseInt(producto.cantidad);
    }

    res.json({ msg: "Pedido recibido", precio: precioTotal });
});

const PORT = 3000;
app.listen(PORT, () => 
{
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});