import { Request, Response, request } from 'express';
import pool from '../../database.config';

export const CrearProducto = async (request: Request, response: Response) => {
    const {
        code,
        name,
        price,
        stock
    } = request.body;

    try {
        const result = await pool.query(
            'INSERT INTO products (code, name, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
            [code, name, price, stock]
        );

        const ProductoAgregado = result.rows[0];
        return response.status(201).json({
            name: ProductoAgregado.name,
            message: 'agregado correctamente.',
            data: ProductoAgregado
        });
    } catch (error) {
        console.error('Error al agregar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const MostrarProducto = async (request: Request, response: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM products'
        );
        const productos = result.rows;
        return response.status(200).json(productos);
    } catch (error) {
        console.error('Error al obtener productos: ', error);
        return response.status(500).json({message: 'Error interno del servidor'});
    }
}

export const EliminarProducto = async (request: Request, response: Response) => {
    const code = request.params.code;

    try {
        const result = await pool.query(
            'DELETE FROM products WHERE code = $1',
            [code]
        );

        if (result.rowCount === 1) {
            return response.status(200).json({
                message:'Producto eliminado correctamente'
            });
        } else {
            return response.status(404).json({
                message: 'No se encontró ningún producto con el código proporcionado'
            });
        }
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};

export const BuscarCodigoProducto = async (request: Request, response: Response) => {
    const idProducto = request.params.id;
    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE codigo = $1',
            [idProducto]
        );

        const usuarioEncontrado = result.rows[0];
        if (!usuarioEncontrado) {
            return response.status(404).json({ message: 'Error... Producto no encontrado' });
        }

        return response.status(200).json(usuarioEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
}

export const BuscarNombreProducto = async (request: Request, response: Response) => {
    const { nombre } = request.query;

    try {
        const result = await pool.query(
            'SELECT * FROM products WHERE nombre ILIKE $1',
            [`%${nombre}%`]
        );

        const productoEncontrado = result.rows;
        return response.status(200).json(productoEncontrado);
    } 
    catch (error) {
        console.error('Error al buscar producto:', error);
        return response.status(500).json({ message: 'Error interno del servidor' });
    }
};