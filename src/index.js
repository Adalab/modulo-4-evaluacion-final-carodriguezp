//configurar mi servidor
//importo mis dependencias

const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../swagger.json');

require("dotenv").config(); //para las variables de entorno

//crear servidor

const server = express();

//configurar servidor

server.use(cors());
server.use(express.json());
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = process.env.PORT;

//conectamos a la base de datos

async function connect_db() {

    const conex = await mysql.createConnection({

        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: "spongeBob",
    });
    conex.connect();
    return conex;
}

connect_db();

//escuchar servidor

server.listen(port, () => {

    console.log(`Mi servidor está escuchando en la ruta http://localhost:${port}`);
});




//ENDPOINTS

//ENDPOINT para todos los personajes

server.get("/personajes", async (req, res) => {


    console.log("ENDPOINT para todos los personajes")

    const conex = await connect_db();

    const personajesSQL = "select * from personajes";

    const [result] = await conex.query(personajesSQL);

    res.json(
        {
            "info": { "count": result.length }, // número de elementos
            "results": result // listado
        }
    );

});

//ENDPOINT para filtrar un personaje 

server.get("/personajes/filter", async (req, res) => {

    console.log("ENDPOINT para un personaje por nombre")

    const nombrePersonaje = req.query.nombre;

    const conex = await connect_db();


    const query = "select * from personajes where nombre = ?";
    const [result] = await conex.query(query, [nombrePersonaje]);

    //VALIDACIONES DEL ENDPOINT

    //validacion del endpoint por si el personaje no existe

    if (result.length === 0) {
        return res.json({ success: true, message: "el nombre no existe" })
    }


    res.json({ success: true, personaje: result[0] });
    conex.end();
});

//ENDPOINT para añadir un personaje

server.post("/personajes", async (req, res) => {

    console.log("ENDPOINT para añadir un personaje")

    const data = req.body;
    const { nombre, apellidos, trabajo, hobbie, imagen } = data;

    const conex = await connect_db();

    const sql = "insert into personajes (nombre, apellidos, trabajo, hobbie, imagen) values (?,?,?,?,?)" //nombres exactos de las columnas de la BS

    const [result] = await conex.query(sql, [nombre, apellidos, trabajo, hobbie, imagen]);

    res.json({
        success: true,
        id: result.insertId // id que generó MySQL para la nueva fila--INSERTID aparece en la consola de la terminal que es del objeto que devuelve results

    });

});

//ENDPOINT para actualizar un personaje existente

server.put("/personajes/:id", async (req, res) => {

    console.log("ENDPOINT para actualizar un personaje existente")

    try {
        const conex = await connect_db();

        const id = req.params.id; //recojo el id de el personaje que quiero modificar

        const data = req.body;
        const { nombre, apellidos, trabajo, hobbie, imagen } = data;

        const sql = "update personajes set nombre =?, apellidos =?, trabajo =?, hobbie=?, imagen=? where id =?";

        const [result] = await conex.query(sql, [nombre, apellidos, trabajo, hobbie, imagen, id,]);

        //VALIDACIONES DEL ENDPOINT

        //validacion del endpoint por si no escriben un número, haremos un condicional

        if (isNaN(parseInt(id))) {
            return res.json({ success: false, error: "el id debe ser un número" })
        }

        //validacion del endpoint por si el personaje no existe

        if (result.length === 0) {
            return res.json({ success: true, message: "el id no existe" })
        }

        res.json({
            success: true,
            message: "Personaje actualizado correctamente"
        })
    } catch (error) {
        console.log(error)
    }

});

//ENDPOINT para eliminar un personaje

server.delete("/personajes/:id", async (req, res) => {

    console.log("ENDPOINT para eliminar un personaje existente")

    try {
        const conex = await connect_db();

        const idPersonaje = req.params.id;

        const sql = "delete from personajes where id = ?";

        const [result] = await conex.query(sql, [idPersonaje]);

        console.log(result, "SDFSDFSD")

        if (result.affectedRows > 0) {
            res.json({

                success: true,
                message: "eliminado correctamente"
            })
        } else {
            res.json({

                success: false,
                message: "NO has eliminado nada"
            })
        }


    } catch (error) {
        console.log(error)
    }


});