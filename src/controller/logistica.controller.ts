import { Request, Response, request } from 'express';
import pool from '../../database.config';

export const SumarStock = async (request: Request, response: Response) => {
    const {
        movement_type,
        code_product,
        lot,
        details
    } = request.body;

    try {
        const productoExistente = await pool.query('SELECT code, stock FROM products WHERE code = $1',
            [code_product]
        );
        if (productoExistente.rows.length > 0) {

            await pool.query('UPDATE products SET stock = stock + $1 WHERE code = $2',
                [lot, code_product]
            )

            const result = await pool.query(
                'INSERT INTO logs (movement_type, datetime, code_product, lot, details) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4) RETURNING *',
                [movement_type, code_product, lot, details]
            );
            const LogsAgregado = result.rows[0];
            return response.status(201).json({
            data: LogsAgregado
        });
        } else {
            console.error('El code product no existe en la tabla productos')
            return response.status(404).json({message: 'El code product no existe en la base de datos'})
        }
    } catch (error) {
        console.error('Ha ocurrido un error al agregar el stock:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const RestarStock = async (request: Request, response: Response) => {
    const {
        movement_type,
        code_product,
        lot,
        details
    } = request.body;

    try {
        const productoExistente = await pool.query('SELECT code, stock FROM products WHERE code = $1',
            [code_product]
        );
        if (productoExistente.rows.length > 0) {

            await pool.query('UPDATE products SET stock = stock - $1 WHERE code = $2',
                [lot, code_product]
            )

            const result = await pool.query(
                'INSERT INTO logs (movement_type, datetime, code_product, lot, details) VALUES ($1, CURRENT_TIMESTAMP, $2, $3, $4) RETURNING *',
                [movement_type, code_product, lot, details]
            );
            const LogsAgregado = result.rows[0];
            return response.status(201).json({
            data: LogsAgregado
        });
        } else {
            console.error('El code product no existe en la tabla productos')
            return response.status(404).json({message: 'El code product no existe en la base de datos'})
        }
    } catch (error) {
        console.error('Ha ocurrido un error al agregar el stock:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const BuscarCodigoProducto = async (request: Request, response: Response) => {
    const code_product = request.params.code;
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE code = $1',
            [code_product]
        );

        const productoEncontrado = result.rows[0];
        if (!productoEncontrado) {
            return response.status(404).json({existente: false,  message: 'Producto no encontrado' });
        }

        return response.status(200).json({existente: true, productoEncontrado});
    } 
    catch (error) {
        console.error('Error al buscar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const MostrarReportes = async (request: Request, response: Response) => {
    try {
        const result = await pool.query(
            'SELECT l.movement_type, l.code_product, p.name, l.lot, l.datetime, l.details FROM logs l JOIN products p ON l.code_product = p.code;'
        );
        const reportes = result.rows;
        return response.status(200).json(reportes);
    } catch (error) {
        console.error('Error al obtener reportes: ', error);
        return response.status(500).json({message: 'Error interno del servidor'});
    }
}