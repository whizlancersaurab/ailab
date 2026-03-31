// spefic student for a schhol
const db = require('../../config/db')
const bcrypt = require("bcryptjs");


exports.speSchoolStudent = async (req, res) => {

    const { schoolId } = req.user;

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
WHERE u.role = 'STUDENT' AND s.id=?
ORDER BY u.id

        `
        const [rows] = await db.query(sql, [schoolId])
        return res.status(200).json({ message: "Student fetched successfully !", data: rows, success: true })

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message, success: false })
    }
}

exports.deleteStudnet = async (req, res) => {

    const connection = await db.getConnection()

    try {
        const { id } = req.params
        const { schoolId } = req.user

        if (!id) {
            return res.status(400).json({ message: "Studnet id is required!", success: false })
        }

        await connection.beginTransaction()

        const checkSql = `
      SELECT u.id 
      FROM users u
      JOIN user_schools us ON us.user_id = u.id
      WHERE u.id = ? 
      AND u.role = 'STUDENT'
      AND us.school_id = ?
    `
        const [student] = await connection.query(checkSql, [id, schoolId])

        if (student.length === 0) {
            await connection.rollback()
            return res.status(404).json({ message: "Student not found in this school!", success: false })
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
            message: "Student account deleted successfully!",
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

exports.addNewStudent = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const { schoolId } = req.user;

    if (!firstName?.trim() || !email?.trim() || !password) {
        return res.status(400).json({
            success: false,
            message: "First name, email, and password are required!"
        });
    }

    const studentProfileImage = req.file ? req.file.path : null;

    const conn = await db.getConnection();
    await conn.beginTransaction();

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
        const [existingStudent] = await conn.query(
            "SELECT id FROM users WHERE email = ? LIMIT 1",
            [email.trim()]
        );

        if (existingStudent.length > 0) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }


        const checkQuery = `
  SELECT 1
  FROM users u
  INNER JOIN user_schools su ON su.user_id = u.id
  WHERE su.school_id = ? AND u.role = "STUDENT"
  LIMIT 1
`;

        const [alreadyCreated] = await conn.query(checkQuery, [schoolId]);

        if (alreadyCreated.length > 0) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: "Student account already exist!"
            });
        }



        const studentHashedPassword = await bcrypt.hash(password, 10);
        const [studentResult] = await conn.query(
            `INSERT INTO users 
       (firstname, lastname, email, password, role, created_at)
       VALUES (?, ?, ?, ?, 'STUDENT', NOW())`,
            [
                firstName.trim(),
                lastName?.trim() || null,
                email.trim(),
                studentHashedPassword
            ]
        );

        const studentId = studentResult.insertId;
        await conn.query(
            `INSERT INTO user_schools 
       (user_id, school_id, profileImage, created_at)
       VALUES (?, ?, ?, NOW())`,
            [studentId, schoolId, studentProfileImage]
        );

        await conn.commit();

        return res.status(201).json({
            success: true,
            message: "Student account  added successfully !"
        });

    } catch (error) {

        await conn.rollback();
        console.error("Add Student Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });

    } finally {
        conn.release();
    }
};

exports.updateStudent = async (req, res) => {
    const { id } = req.params; 
    const { firstName, lastName, email } = req.body;
    const { schoolId } = req.user;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Student id is required!"
        });
    }

    if (!firstName?.trim() || !email?.trim()) {
        return res.status(400).json({
            success: false,
            message: "First name and email are required!"
        });
    }

    const studentProfileImage = req.file ? req.file.path : null;

    const conn = await db.getConnection();
    await conn.beginTransaction();

    try {

       
        const checkSql = `
            SELECT u.id 
            FROM users u
            JOIN user_schools us ON us.user_id = u.id
            WHERE u.id = ? 
            AND u.role = 'STUDENT'
            AND us.school_id = ?
        `;
        const [student] = await conn.query(checkSql, [id, schoolId]);

        if (student.length === 0) {
            await conn.rollback();
            return res.status(404).json({
                success: false,
                message: "Student not found in this school!"
            });
        }

       
        const [existingEmail] = await conn.query(
            "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
            [email.trim(), id]
        );

        if (existingEmail.length > 0) {
            await conn.rollback();
            return res.status(400).json({
                success: false,
                message: "Email already exists!"
            });
        }

        // ✅ UPDATE users table
        await conn.query(
            `UPDATE users 
             SET firstname = ?, lastname = ?, email = ?, updated_at = NOW()
             WHERE id = ?`,
            [
                firstName.trim(),
                lastName?.trim() || null,
                email.trim(),
                id
            ]
        );

        // ✅ UPDATE image only if provided
        if (studentProfileImage) {
            await conn.query(
                `UPDATE user_schools 
                 SET profileImage = ?
                 WHERE user_id = ? AND school_id = ?`,
                [studentProfileImage, id, schoolId]
            );
        }

        await conn.commit();

        return res.status(200).json({
            success: true,
            message: "Student updated successfully!"
        });

    } catch (error) {
        await conn.rollback();
        console.error("Update Student Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error"
        });

    } finally {
        conn.release();
    }
};





