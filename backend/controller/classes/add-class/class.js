
const db = require('../../../config/db')

exports.addClass = async (req, res) => {
    const { className } = req.body;  

    try {
        if (!className) {
            return res
                .status(403)
                .json({ message: "Class name is required!", success: false });
        }

        const sql = `INSERT INTO classes (class_name) VALUES (?)`;  
        await db.query(sql, [className]);

        return res
            .status(201)
            .json({ message: "Class added successfully!", success: true });
    } catch (error) {
        console.error("Error adding class:", error);
        return res
            .status(500)
            .json({ message: "Error while adding class!", success: false });
    }
};

exports.getClasses = async (req, res) => {
    try {
        const sql = `SELECT id, class_name AS className FROM classes ORDER BY id ASC`;
        const [rows] = await db.query(sql);

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error("Error fetching classes:", error);
        return res
            .status(500)
            .json({ message: "Error while fetching classes!", success: false });
    }
};

exports.getClassById = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `SELECT id, class_name AS className FROM classes WHERE id = ?`; 
        const [rows] = await db.query(sql, [id]);

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ message: "Class not found!", success: false });
        }

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Error fetching class:", error);
        return res
            .status(500)
            .json({ message: "Error while fetching class!", success: false });
    }
};

exports.updateClass = async (req, res) => {
    const { id } = req.params;
    const { className } = req.body;  

    try {
        const sql = `UPDATE classes SET class_name = ? WHERE id = ?`; 
        const [result] = await db.query(sql, [className, id]);

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ message: "Class not found!", success: false });
        }

        return res
            .status(200)
            .json({ message: "Class updated successfully!", success: true });
    } catch (error) {
        console.error("Error updating class:", error);
        return res
            .status(500)
            .json({ message: "Error while updating class!", success: false });
    }
};

exports.deleteClass = async (req, res) => {
    const { id } = req.params;

    try {
        const sql = `DELETE FROM classes WHERE id = ?`;
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res
                .status(404)
                .json({ message: "Class not found!", success: false });
        }

        return res
            .status(200)
            .json({ message: "Class deleted successfully!", success: true });
    } catch (error) {
        console.error("Error deleting class:", error);
        return res
            .status(500)
            .json({ message: "Error while deleting class!", success: false });
    }
};

// class for option master
exports.getAllClassForOption = async (req, res) => {
    try {
        const sql = `SELECT id, class_name FROM classes`;  
        const [rows] = await db.query(sql);

        return res.status(200).json({ message: "All classes fetched successfully!", success: true, data: rows });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Internal server error!", success: false });
    }
};
