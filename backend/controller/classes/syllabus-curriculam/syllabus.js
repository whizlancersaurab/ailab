const db = require('../../../config/db');

// Add curriculum months + activities (bulk)
exports.addSyllabusMonths = async (req, res) => {
    const { class_id, months } = req.body;
    const allowedStatus = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

    try {
        // Validation
        if (!class_id || isNaN(class_id)) {
            return res.status(400).json({ success: false, message: "Invalid class_id" });
        }

        if (!Array.isArray(months) || months.length === 0) {
            return res.status(400).json({ success: false, message: "Months array is required" });
        }

        for (let i = 0; i < months.length; i++) {
            const m = months[i];
            if (!m.month_no || isNaN(m.month_no)) {
                return res.status(400).json({ success: false, message: `Invalid month_no at month no ${m.month_no}` });
            }
            if (!m.activity || typeof m.activity !== "string" || !m.activity.trim()) {
                return res.status(400).json({ success: false, message: `Activity is required at month no ${m.month_no}` });
            }
            if (!m.description || typeof m.description !== "string") {
                return res.status(400).json({ success: false, message: `Description is required at month no ${m.month_no}` });
            }
            if (!allowedStatus.includes(m.status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status at month no ${m.month_no}`
                });
            }
        }

        // Check duplicate month_no for same class
        const [existing] = await db.query(
            `SELECT month_no FROM curriculum_months WHERE class_id = ? AND month_no IN (?)`,
            [class_id, months.map(m => m.month_no)]
        );

        if (existing.length > 0) {
            const dupMonths = existing.map(e => e.month_no).join(', ');
            return res.status(409).json({ success: false, message: `Month_no(s) already exist for this class: ${dupMonths}` });
        }

        // Use transaction for bulk insert
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const sql = `
        INSERT INTO curriculum_months (class_id, month_no, title, activity, description , status)
        VALUES (?, ?, ?, ?, ?,?)
      `;

            for (let m of months) {
                await connection.query(sql, [class_id, m.month_no, m.title || '', m.activity.trim(), m.description.trim(), m.status]);
            }

            await connection.commit();
            connection.release();

            return res.status(201).json({ success: true, message: "Curriculum months added successfully" });

        } catch (err) {
            await connection.rollback();
            connection.release();
            console.error("Transaction Error:", err);
            return res.status(500).json({ success: false, message: err.message });
        }

    } catch (error) {
        console.error("Add Curriculum Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllClassSyllabus = async (req, res) => {
    try {

        const sql = `
         SELECT 
         s.id,
         c.class_name AS className,
         s.month_no,
         s.title,
         s.activity,
         s.description,
         s.status,
         s.updated_at
         FROM curriculum_months s
         LEFT JOIN classes c ON c.id = s.class_id
        ORDER BY c.id ASC, s.month_no ASC
        `

        const [rows] = await db.query(sql)
        return res.status(200).json({
            message: 'All class syallabus fetched successfully !',
            success: true,
            data: rows
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: 'Internal server error !', success: false })
    }
}

exports.getSyllabusBYId = async (req, res) => {
    const { id } = req.params
    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Syllabus ID",
        })
    }
    try {

        const sql = `
         SELECT
         cm.id,
         cm.month_no,
         cm.title,
         cm.activity,
         cm.description,
         cm.created_at,
         cm.updated_at,
         c.class_name,
         cm.status
         FROM curriculum_months cm
         LEFT JOIN classes c ON c.id=cm.class_id
         WHERE cm.id=?
        `

        const [rows] = await db.query(sql, [id])
        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Syllabus not found",
            })
        }
        return res.status(200).json({
            success: true,
            data: rows[0],
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, success: false })
    }
}

exports.updateSyllabusMonth = async (req, res) => {
    const { id } = req.params;
    const { title, activity, description, status } = req.body;
    const allowedStatus = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];

    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });
    if (!activity || typeof activity !== "string" || !activity.trim())
        return res.status(400).json({ success: false, message: "Activity is required" });
    if (!description || typeof description !== "string")
        return res.status(400).json({ success: false, message: "Description is required" });
    if (!allowedStatus.includes(status)) {
        return res.status(400).json({
            success: false,
            message: "Invalid status"
        });
    }
    try {
        const sql = `UPDATE curriculum_months SET title = ?, activity = ?, description = ?,status=?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.query(sql, [title || '', activity.trim(), description.trim(), status, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Curriculum month not found" });
        }

        return res.status(200).json({ success: true, message: "Curriculum month updated successfully" });
    } catch (error) {
        console.error("Update Curriculum Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};


exports.deleteSyllabusMonth = async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid id" });

    try {
        const sql = `DELETE FROM curriculum_months WHERE id = ?`;
        const [result] = await db.query(sql, [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Curriculum month not found" });
        }

        return res.status(200).json({ success: true, message: "Curriculum month deleted successfully" });
    } catch (error) {
        console.error("Delete Curriculum Error:", error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// options

exports.getMonthForOptionByClassId = async (req, res) => {
    const { class_id } = req.params;
    if (!class_id || isNaN(class_id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid Class!",
        });
    }

    try {
        const sql = `
            SELECT
                cm.id,
                cm.month_no
            FROM curriculum_months cm
            WHERE cm.class_id = ?
            AND cm.status <> 'COMPLETED'
            ORDER BY cm.month_no ASC
        `;

        const [rows] = await db.query(sql, [class_id]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No pending months found",
            });
        }

        return res.status(200).json({
            success: true,
            data: rows,
        });

    } catch (error) {
        console.error("Get Month Option Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

exports.getSyllabusByClassIdAndId = async (req, res) => {
    const { class_id, id } = req.params;
    try {
        const sql = `SELECT 
         id,
         title,
         activity
         FROM curriculum_months WHERE class_id = ? AND id=? ORDER BY month_no ASC`;
        const [rows] = await db.query(sql, [class_id, id]);

        return res.status(200).json({ success: true, data: rows[0] });
    } catch (error) {
        console.error("Get Curriculum Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};



