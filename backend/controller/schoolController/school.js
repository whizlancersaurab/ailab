const db = require('../../config/db')


exports.allSchools = async (req, res) => {

    try {

        const sql = `
     SELECT 
     s.id,
     u.firstname,
     u.lastname,
     u.email,
     s.name,
     s.status,
     s.profileImage,
     s.schoolLogo,
     s.created_at
     FROM users u
     LEFT JOIN schools s ON s.id=u.school_id
     WHERE u.role !='SUPER_ADMIN'
        `

        const [rows] = await db.query(sql)
        return res.status(200).json({ message: "All school data fetched successfully !", data: rows, success: true })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, success: false })
    }
}
exports.allActiveSchools = async (req, res) => {

    try {

        const sql = `
     SELECT 
     s.id,
     u.firstname,
     u.lastname,
     u.email,
     s.name,
       s.profileImage,
     s.schoolLogo,
     s.status,
     s.created_at
     FROM users u
     LEFT JOIN schools s ON s.id=u.school_id
     WHERE u.role !='SUPER_ADMIN' AND s.status="ACTIVE"
        `

        const [rows] = await db.query(sql)
        return res.status(200).json({ message: "All active school data fetched successfully !", data: rows, success: true })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, success: false })
    }
}
exports.allSuspendedSchools = async (req, res) => {

    try {

        const sql = `
     SELECT 
     s.id,
     u.firstname,
     u.lastname,
     u.email,
     s.name,
     s.status,
       s.profileImage,
     s.schoolLogo,
     s.created_at,
     s.updated_at
     FROM users u
     LEFT JOIN schools s ON s.id=u.school_id
     WHERE u.role !='SUPER_ADMIN' AND s.status="SUSPENDED"
        `

        const [rows] = await db.query(sql)
        return res.status(200).json({ message: "All suspended school data fetched successfully !", data: rows, success: true })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, success: false })
    }
}

exports.speSchool = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Valid school ID is required",
    });
  }

  try {
    const sql = `
      SELECT 
        s.name,
        s.status,
        u.firstname,
        u.lastname
      FROM schools s
      LEFT JOIN users u ON u.school_id=s.id
      WHERE s.id = ?
    `;

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School fetched successfully",
      data: rows[0],
    });

  } catch (error) {
    console.error("speSchool error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.changeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({
      success: false,
      message: "School ID and status are required",
    });
  }

  try {
    const sql = `UPDATE schools SET status = ? , updated_at = NOW() WHERE id = ?`;
    const [result] = await db.query(sql, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School status updated successfully",
    });

  } catch (error) {
    console.error("changeStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateSchool = async (req, res) => {
  const { id } = req.params;
  const { status, firstname, lastname } = req.body;

  if (!id || !status || !firstname || !lastname) {
    return res.status(400).json({
      success: false,
      message: "School ID, status, firstname, and lastname are required",
    });
  }

  const connection = await db.getConnection(); // assuming pool
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `UPDATE schools SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const [result2] = await connection.query(
      `UPDATE users SET firstname = ?, lastname = ?, updated_at = NOW() WHERE school_id = ?`,
      [firstname, lastname, id]
    );

    if (result2.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: "User for the school not found",
      });
    }

    await connection.commit();
    return res.status(200).json({
      success: true,
      message: "School status and user updated successfully",
    });

  } catch (error) {
    await connection.rollback();
    console.error("changeStatus error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    connection.release();
  }
};

exports.deleteSchool = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Valid school ID is required",
    });
  }

  try {
    const [result] = await db.query(
      "DELETE FROM schools WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "School deleted successfully",
    });

  } catch (error) {
    console.error("deleteSchool error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


// super admin
exports.schoolStats = async (req, res) => {
  try {
    const sql = `
      SELECT
        COUNT(*) AS totalSchools,
        COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) AS activeSchools,
        COUNT(CASE WHEN status = 'SUSPENDED' THEN 1 END) AS suspendedSchools
      FROM schools
    `;

    const [rows] = await db.query(sql);

    return res.status(200).json({
      success: true,
      message: "School statistics fetched successfully",
      data: rows[0],
    });

  } catch (error) {
    console.error("schoolStats error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
