const db = require('../../config/db')
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const transporter = require("../../utils/sendEmail");


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
    us.profileImage,
    s.schoolLogo,
    s.created_at
FROM users u
LEFT JOIN user_schools us ON us.user_id = u.id
LEFT JOIN schools s ON s.id = us.school_id
WHERE u.role = 'ADMIN'
ORDER BY u.id

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
    us.profileImage,
    s.schoolLogo,
    s.created_at
FROM users u
LEFT JOIN user_schools us ON us.user_id = u.id
LEFT JOIN schools s ON s.id = us.school_id
     WHERE u.role ='ADMIN' AND s.status="ACTIVE"
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
    us.profileImage,
    s.schoolLogo,
    s.created_at
FROM users u
LEFT JOIN user_schools us ON us.user_id = u.id
LEFT JOIN schools s ON s.id = us.school_id
     WHERE u.role ='ADMIN' AND s.status="SUSPENDED"
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
        COUNT(CASE WHEN s.status = 'ACTIVE' THEN 1 END) AS activeSchools,
        COUNT(CASE WHEN s.status = 'SUSPENDED' THEN 1 END) AS suspendedSchools
      FROM schools s
      LEFT JOIN user_schools us ON us.school_id = s.id
      LEFT JOIN users u ON us.user_id = u.id
      WHERE role='ADMIN'
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



function generatePassword(length = 8) {
  return crypto.randomBytes(length).toString("base64").slice(0, length);
}

exports.addNewSchool = async (req, res) => {
  const { schoolName, userId, teacher } = req.body;

  if (!userId || !schoolName?.trim() || !teacher) {
    return res.status(400).json({
      success: false,
      message: "School name, userId and teacher details are required!"
    });
  }

  let teacherData;

  try {
    teacherData = JSON.parse(teacher);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid teacher data format"
    });
  }

  const { firstName, lastName, email } = teacherData;

  if (!firstName?.trim() || !email?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Teacher first name and email are required"
    });
  }

  const profileImage = req.files?.profileImage?.[0]?.path || null;
  const schoolLogo = req.files?.schoolLogo?.[0]?.path || null;
  const teacherProfileImage = req.files?.teacherProfileImage?.[0]?.path || null;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {

    const [owner] = await conn.query(
      "SELECT id FROM users WHERE id = ? LIMIT 1",
      [userId]
    );

    if (owner.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "Owner user not found"
      });
    }
    const [schoolResult] = await conn.query(
      `INSERT INTO schools (name, status, schoolLogo, created_at)
       VALUES (?, 'ACTIVE', ?, NOW())`,
      [schoolName.trim(), schoolLogo]
    );

    const schoolId = schoolResult.insertId;
    await conn.query(
      `INSERT INTO user_schools (user_id, school_id, profileImage, created_at)
       VALUES (?, ?, ?, NOW())`,
      [userId, schoolId, profileImage]
    );

    const [existingTeacher] = await conn.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email.trim()]
    );

    if (existingTeacher.length > 0) {
      throw new Error("Teacher email already exists");
    }
    const teacherPlainPassword = generatePassword(8);
    const teacherHashedPassword = await bcrypt.hash(teacherPlainPassword, 10);
    const [teacherResult] = await conn.query(
      `INSERT INTO users 
       (firstname, lastname, email, password, role, created_at)
       VALUES (?, ?, ?, ?, 'TEACHER', NOW())`,
      [
        firstName.trim(),
        lastName?.trim() || null,
        email.trim(),
        teacherHashedPassword
      ]
    );

    const teacherId = teacherResult.insertId;

    await conn.query(
      `INSERT INTO user_schools (user_id, school_id, profileImage, created_at)
       VALUES (?, ?, ?, NOW())`,
      [teacherId, schoolId, teacherProfileImage]
    );
    await conn.commit();


    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email.trim(),
      subject: "Teacher Account Created",
      text: `Hello ${firstName},

Your Teacher account has been created successfully.

Login Details:
Email: ${email}
Password: ${teacherPlainPassword}

Please login and change your password immediately.

Thank you.`
    });

    return res.status(201).json({
      success: true,
      message: "School and teacher added successfully and email sent"
    });

  } catch (error) {

    await conn.rollback();
    console.error("❌ Add School Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });

  } finally {
    conn.release();
  }
};

// super admin extra feature
// SCHOOL DASHBOARD DATA
exports.devicesCountForSchoolDas = async (req, res) => {
  const { schoolId } = req.params;
  try {
    const sql = `
            SELECT COUNT(*) AS devices 
            FROM devices WHERE school_id=?
        `;

    const [rows] = await db.query(sql, [schoolId]);

    return res.status(200).json({
      success: true,
      devices: rows[0].devices
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.TotaldeviceTypeCountForSchoolDas = async (req, res) => {
  const { schoolId } = req.params;
  try {
    const sql = `
            SELECT 
                COUNT(DISTINCT CONCAT(d.category_id, '-', d.sub_category_id)) AS totalTypes
            FROM devices d WHERE school_id=?
        `;

    const [rows] = await db.query(sql, [schoolId]);

    return res.status(200).json({
      success: true,
      data: rows[0].totalTypes,
      message: 'Total device types count fetched successfully'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getOutOfStockDeviceCountForSchoolDas = async (req, res) => {
  const { schoolId } = req.params;
  try {
    const [rows] = await db.query('SELECT COUNT(id) AS count FROM devices WHERE quantity <= 0 AND school_id=?', [schoolId]);
    return res.status(200).json({
      message: 'Out of stock devices fetched successfully!',
      success: true,
      data: rows[0].count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

// super admin

exports.aiDevicesCountForSchoolDas = async (req, res) => {
  const { schoolId } = req.params
  try {
    const sql = `
            SELECT COUNT(*) AS devices 
            FROM ai_devices WHERE school_id=?
        `;

    const [rows] = await db.query(sql, [schoolId]);

    return res.status(200).json({
      success: true,
      devices: rows[0].devices
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.aiTotaldeviceTypeCountForSchoolDas = async (req, res) => {
  const { schoolId } = req.params
  try {
    const sql = `
            SELECT 
                COUNT(DISTINCT CONCAT(d.category_id, '-', d.sub_category_id)) AS totalTypes
            FROM ai_devices d WHERE d.school_id=?
        `;

    const [rows] = await db.query(sql, [schoolId]);

    return res.status(200).json({
      success: true,
      data: rows[0].totalTypes,
      message: 'Total device types count fetched successfully'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.aiGetOutOfStockDeviceCountForSchoolDas = async (req, res) => {
  const { schoolId } = req.params
  try {
    const [rows] = await db.query('SELECT COUNT(id) AS count FROM ai_devices WHERE quantity <= 0 AND school_id=?', [schoolId]);
    return res.status(200).json({
      message: 'Out of stock devices fetched successfully!',
      success: true,
      data: rows[0].count,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};

exports.getAllRoboticsDevicesForSchoolDas = async (req, res) => {
  const { schoolId } = req.params;
  try {
    const [devices] = await db.query(`
            SELECT 
                d.id,
                d.device_name,
                d.device_code,
                d.quantity,
                c.category,
                s.sub_category_name AS sub_category,
                d.created_at
            FROM devices d
            JOIN category c ON d.category_id = c.id
            JOIN sub_categories s ON d.sub_category_id = s.id
            WHERE d.school_id = ?
            ORDER BY d.id DESC
        `, [schoolId]);

    res.status(200).json({ success: true, data: devices });

  } catch (error) {
    console.error("Get Devices Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.deviceTypeCountForSchoolDas = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const [rows] = await db.query(`
            SELECT 
                c.category AS category,
                sc.sub_category_name AS subcategory,
                COUNT(d.id) AS total
            FROM devices d
            JOIN category c ON d.category_id = c.id
            JOIN sub_categories sc ON d.sub_category_id = sc.id
            WHERE d.school_id = ?
            GROUP BY d.category_id, d.sub_category_id
            ORDER BY c.category, sc.sub_category_name
        `, [schoolId]);

    res.status(200).json({ success: true, data: rows, message: 'Device category & subcategory count fetched successfully' });

  } catch (error) {
    console.error("deviceTypeCount Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.OutOfStockDevicesForSchoolDas = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const [devices] = await db.query(`
            SELECT 
                d.id,
                d.device_name,
                d.device_code,
                c.category,
                s.sub_category_name AS sub_category,
                d.created_at
            FROM devices d
            JOIN category c ON d.category_id = c.id
            JOIN sub_categories s ON d.sub_category_id = s.id
            WHERE d.quantity <= 0 AND d.school_id = ?
            ORDER BY d.id DESC
        `, [schoolId]);

    res.status(200).json({ success: true, message: 'Out of stock devices fetched successfully!', data: devices });

  } catch (error) {
    console.error("OutOfStockDevices Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.AideviceTypeCountForSchoolDas = async (req, res) => {
  const { schoolId } = req.params
  try {
    const sql = `
            SELECT 
                c.category AS category,
                sc.sub_category_name AS subcategory,
                COUNT(d.id) AS total
            FROM ai_devices d
            JOIN ai_category c ON d.category_id = c.id
            JOIN ai_sub_categories sc ON d.sub_category_id = sc.id
            WHERE d.school_id=?
            GROUP BY d.category_id, d.sub_category_id
            ORDER BY c.category, sc.sub_category_name
        `;

    const [rows] = await db.query(sql, [schoolId]);

    return res.status(200).json({
      success: true,
      data: rows,
      message: 'Device category & subcategory count fetched successfully'
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.AiOutOfStockDevicesForSchoolDas = async (req, res) => {

  const { schoolId } = req.params

  try {

    const [devices] = await db.query(`
            SELECT 
                d.id,
                d.device_name,
                d.device_code,  
                c.category,
                s.sub_category_name AS sub_category,
                d.created_at
            FROM ai_devices d
            JOIN ai_category c ON d.category_id = c.id
            JOIN ai_sub_categories s ON d.sub_category_id = s.id
             WHERE d.quantity <= 0 AND d.school_id=?
            ORDER BY d.id DESC
            
        ` , [schoolId]);
    return res.status(200).json({
      message: 'Out of stock devices fetched successfully!',
      success: true,
      data: devices,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false,
    });
  }
};


exports.AiGetAllDevicesForSchoolDas = async (req, res) => {
  const { schoolId } = req.params
  try {
    const [devices] = await db.query(`
            SELECT 
                d.id,
                d.device_name,
                d.device_code,
                d.quantity,
                c.category,
                s.sub_category_name AS sub_category,
                d.created_at
            FROM ai_devices d
            JOIN ai_category c ON d.category_id = c.id
            JOIN ai_sub_categories s ON d.sub_category_id = s.id
            WHERE d.school_id=?
            ORDER BY d.id DESC
        ` , [schoolId]);

    res.status(200).json({ success: true, data: devices });

  } catch (error) {
    console.error("Get Devices Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};







