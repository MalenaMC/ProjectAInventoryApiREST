import Router from 'express';
import {BuscarCodigoProducto, MostrarReportes, RestarStock, SumarStock} from '../controller/logistica.controller';

export const LogisticaRuta = Router()

LogisticaRuta.post("/sumar_stock", SumarStock); 
LogisticaRuta.get("/buscar_codigo/:code", BuscarCodigoProducto);
LogisticaRuta.post("/restar_stock", RestarStock)
LogisticaRuta.get("/mostrar_reportes", MostrarReportes)  