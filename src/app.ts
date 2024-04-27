import express from 'express';
import bodyParser from 'body-parser';
import pool from '../database.config';
import cors from 'cors';
import { ProductoRuta } from './routes/producto.route';
import { UsuarioRuta } from './routes/usuario.route';
import { LogisticaRuta } from './routes/logistica.route';

function appInit() {
    //Inicializamos Init express
    const app = express();
    app.use(cors());

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json())

    //Uso de un Usuario, Producto y Logistica
    app.use(UsuarioRuta);
    app.use(ProductoRuta);
    app.use(LogisticaRuta);

    //Configurar express para servir archivos estáticos desde la carpeta 'uploads'
    app.use('/uploads', express.static('uploads'));

    //Que la aplicación solo escuche el puerto 3000
    app.listen(3000);
    console.log('Server running on port http://localhost:3000');

    pool.query("SELECT * FROM users",(error,results)=>{
        console.log("Se realizo la consulta de usuario correctamente");
    })
    pool.query("SELECT * FROM products",(error,results)=>{
        console.log("Se realizo la consulta de producto correctamente");
    })
    pool.query("SELECT * FROM logs",(error,results)=>{
        console.log("Se realizo la consulta de logistica correctamente");
    })
    
}

appInit();