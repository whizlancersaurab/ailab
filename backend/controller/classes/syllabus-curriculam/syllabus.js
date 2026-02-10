const db = require('../../../config/db');

// Add curriculum months + activities (bulk)
exports.addSyllabusMonths = async (req, res) => {
    const { class_id, months } = req.body;
    const schoolId = req.schoolId;
    const allowedStatus = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

    try {
        if (!schoolId) return res.status(400).json({ success: false, message: "School ID missing" });
        if (!class_id || isNaN(class_id)) return res.status(400).json({ success: false, message: "Invalid class_id" });
        if (!Array.isArray(months) || months.length === 0) return res.status(400).json({ success: false, message: "Months array is required" });

        for (let m of months) {
            if (!m.month_no || isNaN(m.month_no)) return res.status(400).json({ success: false, message: `Invalid month_no` });
            if (!m.activity || !m.activity.trim()) return res.status(400).json({ success: false, message: `Activity is required for month ${m.month_no}` });
            if (!m.description || !m.description.trim()) return res.status(400).json({ success: false, message: `Description is required for month ${m.month_no}` });
            if (!allowedStatus.includes(m.status)) return res.status(400).json({ success: false, message: `Invalid status for month ${m.month_no}` });
        }

        // Duplicate check: class + month + school
        const [existing] = await db.query(
            `SELECT month_no FROM curriculum_months WHERE class_id=? AND school_id=? AND month_no IN (?)`,
            [class_id, schoolId, months.map(m => m.month_no)]
        );

        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: `Month(s) already exist: ${existing.map(e => e.month_no).join(', ')}` });
        }

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const sql = `
                INSERT INTO curriculum_months 
                (school_id, class_id, month_no, title, activity, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            for (let m of months) {
                await connection.query(sql, [schoolId, class_id, m.month_no, m.title || '', m.activity.trim(), m.description.trim(), m.status]);
            }
            await connection.commit();
            connection.release();

            return res.status(201).json({ success: true, message: "Curriculum months added successfully" });
        } catch (err) {
            await connection.rollback();
            connection.release();
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get all syllabus for school
exports.getAllClassSyllabus = async (req, res) => {
    const schoolId = req.schoolId;
    try {
        const sql = `
            SELECT s.id, c.class_name AS className, s.month_no, s.title, s.activity, s.description, s.status, s.updated_at
            FROM curriculum_months s
            LEFT JOIN classes c ON c.id = s.class_id
            WHERE s.school_id=?
            ORDER BY c.id ASC, s.month_no ASC
        `;
        const [rows] = await db.query(sql, [schoolId]);
        return res.status(200).json({ success: true, message: 'All class syllabus fetched successfully!', data: rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

// Get syllabus by ID (school-wise)
exports.getSyllabusById = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;

    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid syllabus ID" });

    try {
        const sql = `
            SELECT cm.id, cm.month_no, cm.title, cm.activity, cm.description, cm.created_at, cm.updated_at, c.class_name, cm.status
            FROM curriculum_months cm
            LEFT JOIN classes c ON c.id = cm.class_id
            WHERE cm.id=? AND cm.school_id=?
        `;
        const [rows] = await db.query(sql, [id, schoolId]);

        if (rows.length === 0) return res.status(404).json({ success: false, message: "Syllabus not found" });

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Update syllabus month (school-wise)
exports.updateSyllabusMonth = async (req, res) => {
    const { id } = req.params;
    const { title, activity, description, status } = req.body;
    const schoolId = req.schoolId;
    const allowedStatus = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    if (!activity || !activity.trim()) return res.status(400).json({ success: false, message: "Activity is required" });
    if (!description || !description.trim()) return res.status(400).json({ success: false, message: "Description is required" });
    if (!allowedStatus.includes(status)) return res.status(400).json({ success: false, message: "Invalid status" });

    try {
        const sql = `
            UPDATE curriculum_months
            SET title=?, activity=?, description=?, status=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=? AND school_id=?
        `;
        const [result] = await db.query(sql, [title || '', activity.trim(), description.trim(), status, id, schoolId]);

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Curriculum month not found" });

        return res.status(200).json({ success: true, message: "Curriculum month updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Delete syllabus month (school-wise)
exports.deleteSyllabusMonth = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;

    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    try {
        const sql = `DELETE FROM curriculum_months WHERE id=? AND school_id=?`;
        const [result] = await db.query(sql, [id, schoolId]);

        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Curriculum month not found" });

        return res.status(200).json({ success: true, message: "Curriculum month deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get pending months for options (school + class-wise)
exports.getMonthForOptionByClassId = async (req, res) => {
    const { class_id } = req.params;
    const schoolId = req.schoolId;

    if (!class_id || isNaN(class_id)) return res.status(400).json({ success: false, message: "Invalid Class ID" });

    try {
        const sql = `
            SELECT cm.id, cm.month_no
            FROM curriculum_months cm
            WHERE cm.class_id=? AND cm.school_id=? AND cm.status<>'COMPLETED'
            ORDER BY cm.month_no ASC
        `;
        const [rows] = await db.query(sql, [class_id, schoolId]);

        if (rows.length === 0) return res.status(404).json({ success: false, message: "No pending months found" });

        return res.status(200).json({ success: true, data: rows });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// Get syllabus by class_id and syllabus id (school-wise)
exports.getSyllabusByClassIdAndId = async (req, res) => {
    const { class_id, id } = req.params;
    const schoolId = req.schoolId;

    if (!class_id || isNaN(class_id) || !id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid parameters" });

    try {
        const sql = `
            SELECT id, title, activity
            FROM curriculum_months
            WHERE class_id=? AND id=? AND school_id=?
            ORDER BY month_no ASC
        `;
        const [rows] = await db.query(sql, [class_id, id, schoolId]);

        if (!rows.length) return res.status(404).json({ success: false, message: "Syllabus not found" });

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
