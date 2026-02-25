// spefic teachers for a schhol
const db = require('../../config/db')
const bcrypt = require("bcryptjs");

exports.speSchoolTeachers = async (req, res) => {

  const  {schoolId}  = req.user;
  
  try {

    const sql = `
    SELECT
    s.id,
    u.firstname,
    u.lastname,
    u.email,
    u.id AS userId,
    s.name,
    us.profileImage,
    s.schoolLogo,
    u.created_at
FROM users u
LEFT JOIN user_schools us ON us.user_id = u.id
LEFT JOIN schools s ON s.id = us.school_id
WHERE u.role = 'TEACHER' AND s.id=?
ORDER BY u.id

        `
    const [rows] = await db.query(sql ,[schoolId])
    return res.status(200).json({ message: "Teachers fetched successfully !", data: rows, success: true })

  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: error.message, success: false })
  }
}



exports.deleteTeacher = async (req, res) => {

  const connection = await db.getConnection()

  try {
    const { id } = req.params
    const { schoolId } = req.user

    if (!id) {
      return res.status(400).json({ message: "Teacher id is required!", success: false })
    }

    await connection.beginTransaction()

    const checkSql = `
      SELECT u.id 
      FROM users u
      JOIN user_schools us ON us.user_id = u.id
      WHERE u.id = ? 
      AND u.role = 'TEACHER'
      AND us.school_id = ?
    `
    const [teacher] = await connection.query(checkSql, [id, schoolId])

    if (teacher.length === 0) {
      await connection.rollback()
      return res.status(404).json({ message: "Teacher not found in this school!", success: false })
    }

   
    const deleteMappingSql = `
      DELETE FROM user_schools 
      WHERE user_id = ? AND school_id = ?
    `
    await connection.query(deleteMappingSql, [id, schoolId])

    
    const deleteUserSql = `
      DELETE FROM users 
      WHERE id = ?
    `
    await connection.query(deleteUserSql, [id])

    await connection.commit()

    return res.status(200).json({
      message: "Teacher deleted successfully!",
      success: true
    })

  } catch (error) {
    await connection.rollback()
    console.log(error)
    return res.status(500).json({ message: error.message, success: false })
  } finally {
    connection.release()
  }
}

exports.addNewTeacher = async (req, res) => {
  const { firstName, lastName, email } = req.body;
  const { schoolId } = req.user;

  if (!firstName?.trim() || !email?.trim()) {
    return res.status(400).json({
      success: false,
      message: "First name and email are required!"
    });
  }
  const teacherProfileImage = req.file ? req.file.path : null;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  // check school exist or not
  try {
    const [school] = await conn.query(
      "SELECT id FROM schools WHERE id = ? LIMIT 1",
      [schoolId]
    );

    if (school.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }
    const [existingTeacher] = await conn.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email.trim()]
    );

    if (existingTeacher.length > 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Teacher email already exists"
      });
    }
    const hashedPassword = await bcrypt.hash("12345678", 10);

    const [teacherResult] = await conn.query(
      `INSERT INTO users 
       (firstname, lastname, email, password, role, created_at)
       VALUES (?, ?, ?, ?, 'TEACHER', NOW())`,
      [
        firstName.trim(),
        lastName?.trim() || null,
        email.trim(),
        hashedPassword
      ]
    );


    const teacherId = teacherResult.insertId;

    await conn.query(
      `INSERT INTO user_schools 
       (user_id, school_id, profileImage, created_at)
       VALUES (?, ?, ?, NOW())`,
      [teacherId, schoolId, teacherProfileImage]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "Teacher added successfully"
    });

  } catch (error) {
    await conn.rollback();
    console.error("Add Teacher Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  } finally {
    conn.release();
  }
};