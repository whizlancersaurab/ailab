const db = require('../../config/db')


exports.allSchools = async (req, res) => {

  try {



    const sql = `
    SELECT
    s.id,
    u.firstname,
    u.lastname,
    u.email,
    u.id AS userId,
    s.name,
    s.status,
    s.profileImage,
    s.schoolLogo,
    s.created_at
FROM users u
LEFT JOIN user_schools us ON us.user_id = u.id
LEFT JOIN schools s ON s.id = us.school_id
WHERE u.role != 'SUPER_ADMIN'

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
    s.status,
    s.profileImage,
    s.schoolLogo,
    s.created_at
FROM users u
LEFT JOIN user_schools us ON us.user_id = u.id
LEFT JOIN schools s ON s.id = us.school_id
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
    s.created_at
FROM users u
LEFT JOIN user_schools us ON us.user_id = u.id
LEFT JOIN schools s ON s.id = us.school_id
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
        s.status
      FROM schools s
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

exports.addNewSchool = async (req, res) => {
  const { schoolName, userId } = req.body;

  if (!userId || !schoolName?.trim()) {
    return res.status(400).json({
      success: false,
      message: "User ID and School Name are required!"
    });
  }

  const profileImage = req.files?.profileImage?.[0]?.path || null;
  const schoolLogo = req.files?.schoolLogo?.[0]?.path || null;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {


    const [users] = await conn.query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (users.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const [schoolResult] = await conn.query(
      `INSERT INTO schools (name, status, profileImage, schoolLogo, created_at)
       VALUES (?, 'ACTIVE', ?, ?, NOW())`,
      [schoolName.trim(), profileImage, schoolLogo]
    );

    const schoolId = schoolResult.insertId;

   
    await conn.query(
      `INSERT INTO user_schools (user_id, school_id)
       VALUES (?, ?)`,
      [userId, schoolId]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "New school added successfully",
      data: {
        schoolId,
        schoolName
      }
    });

  } catch (error) {
    await conn.rollback();
    console.error("❌ Add School Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  } finally {
    conn.release();
  }
};





