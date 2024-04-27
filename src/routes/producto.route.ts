import Router from 'express';
import {CrearProducto, MostrarProducto, BuscarNombreProducto, EliminarProducto } from '../controller/producto.controller';

export const ProductoRuta = Router()

ProductoRuta.post("/registrar_producto", CrearProducto); 
ProductoRuta.get("/mostrar_producto", MostrarProducto)  
ProductoRuta.delete("/eliminar_producto/:code", EliminarProducto);
ProductoRuta.get("/buscar", BuscarNombreProducto);
