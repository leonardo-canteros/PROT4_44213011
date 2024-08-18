import {pool} from './database.js';

class LibroController {

  async getAll(req, res) {
    try {
      const [result] = await pool.query('SELECT * FROM libros'); 
      res.json(result);
    } catch (error) {
      // Manejar error 
      res.status(500).json({ message: "Error al obtener los libros", error });
    }
  }

    // Obtener un libro por su ID
async getOne(req, res) {
  // Obtenemos el ID del libro de los parámetros de la ruta
  const { id } = req.params;

  try {
    const [result] = await pool.query('SELECT * FROM libros WHERE id = ?', [id]);

    if (result.length === 0) {
      // Si no se encuentra el libro, devolver un error
      res.status(404).json({ message: "Libro no encontrado" });
    } else {
      res.json(result[0]);
    }
  } catch (error) {
    // Manejo de error 
    res.status(500).json({ message: "Error al obtener el libro", error });
  }
}

  async add(req, res) {
    const libro = req.body;
    try {
      // Validar que solo se envíen atributos válidos
      if (
        !libro.nombre ||
        !libro.autor ||
        !libro.categoria ||
        !libro['ano-publicacion'] ||
        !libro.ISBN
      ) {
        return res.status(400).json({ message: "Faltan atributos requeridos" });
      }

      const [result] = await pool.query(
        'INSERT INTO libros (nombre, autor, categoria, `ano-publicacion`, ISBN) VALUES (?, ?, ?, ?, ?)',
        [
          libro.nombre,
          libro.autor,
          libro.categoria,
          libro['ano-publicacion'],
          libro.ISBN,
        ]
      );
      res.json({ 'Id insertado': result.insertId });
    } catch (error) {
      // Manejar cualquier error que ocurra durante la inserción
      res.status(500).json({ message: "Error al agregar el libro", error });
    }
  }

  async delete(req, res) {
    const { ISBN } = req.body; // Se obtiene el ISBN desde el cuerpo de la solicitud
    try {
      // Primero, se busca el libro por su ISBN
      const [result] = await pool.query(
        'SELECT id FROM libros WHERE ISBN = ?',
        [ISBN]
      );

      if (result.length === 0) {
        // Si no se encuentra el libro, devolver un error 404
        return res.status(404).json({ message: "Libro no encontrado" });
      }

      // Obtener el ID del libro encontrado
      const libroId = result[0].id;

      // Proceder a eliminar el libro por su ID
      const [deleteResult] = await pool.query(
        'DELETE FROM libros WHERE id = ?',
        [libroId]
      );

      if (deleteResult.affectedRows === 0) {
        res.status(404).json({ message: "No se pudo eliminar el libro" });
      } else {
        res.json({ "Registros eliminados": deleteResult.affectedRows });
      }
    } catch (error) {
      // Manejar cualquier error que ocurra durante la eliminación
      res.status(500).json({ message: "Error al eliminar el libro", error });
    }
  }

    // Actualizar un libro existente
  async update(req, res) {
    const libro = req.body;
    try {
      // Validar que solo se envíen atributos válidos
      if (
        !libro.id ||
        !libro.nombre ||
        !libro.autor ||
        !libro.categoria ||
        !libro['ano-publicacion'] ||
        !libro.ISBN
      ) {
        return res.status(400).json({ message: "Faltan atributos requeridos" });
      }

      const [result] = await pool.query(
        'UPDATE libros SET nombre = ?, autor = ?, categoria = ?, `ano-publicacion` = ?, ISBN = ? WHERE id = ?',
        [
          libro.nombre,
          libro.autor,
          libro.categoria,
          libro['ano-publicacion'],
          libro.ISBN,
          libro.id,
        ]
      );

      if (result.changedRows === 0) {
        // Si no se actualizó ningún libro, devolver un error 404
        res.status(404).json({ message: "Libro no encontrado" });
      } else {
        res.json({ "Registro actualizado": result.changedRows });
      }
    } catch (error) {
      // Manejar cualquier error que ocurra durante la actualización
      res.status(500).json({ message: "Error al actualizar el libro", error });
    }
  }

}

export const libro = new LibroController();