const db = require("../../config/db");
const bcrypt = require("bcryptjs");
const transporter = require('../../utils/sendEmail');
require('dotenv').config()
const jwt = require('jsonwebtoken')

exports.update = async (req, res) => {
  const userId = req.user.id;
  const { schoolId } = req.user;
  const { firstName, lastName, email, schoolName } = req.body;

  if (!userId || !schoolId) {
    return res.status(400).json({
      success: false,
      message: "User ID and School ID are required for update",
    });
  }

  const profileImage = req.files?.profileImage?.[0]?.path;
  const schoolLogo = req.files?.schoolLogo?.[0]?.path;

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
   
    if (!firstName?.trim() || !email?.trim() || !schoolName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "First name, email, and school name are required",
      });
    }

   
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    
    const [existingUser] = await conn.query(
      "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
      [email.trim(), userId]
    );

    if (existingUser.length > 0) {
      await conn.rollback();
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    
    const [schoolRows] = await conn.query("SELECT profileImage, schoolLogo FROM schools WHERE id = ?", [schoolId]);
    if (schoolRows.length === 0) {
      await conn.rollback();
      return res.status(404).json({
        success: false,
        message: "School not found",
      });
    }

    const existingProfileImage = schoolRows[0].profileImage;
    const existingSchoolLogo = schoolRows[0].schoolLogo;

 
    await conn.query(
      `UPDATE schools 
       SET name = ?, profileImage = ?, schoolLogo = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        schoolName.trim(),
        profileImage || existingProfileImage,
        schoolLogo || existingSchoolLogo,
        schoolId
      ]
    );



  
    await conn.query(
      `UPDATE users
       SET firstname = ?, lastname = ?, email = ?
       WHERE id = ?`,
      [
        firstName.trim(),
        lastName?.trim() || null,
        email.trim(),
        userId
      ]
    );

    await conn.commit();

    return res.status(200).json({
      success: true,
      message: "School and user updated successfully"
    });

  } catch (error) {
    await conn.rollback();
    console.error("❌ Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  } finally {
    conn.release();
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;


    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email,]);
    if (!users || users.length === 0) {
      return res
        .status(403)
        .json({ message: "Please provide a valid email!", success: false });
    }


    const otp = Math.floor(100000 + Math.random() * 900000);


    await db.query(
      "UPDATE users SET reset_otp=?, reset_otp_expiry=? WHERE email=?",
      [otp, Date.now() + 10 * 60 * 1000, email]
    );

    // Send OTP email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    return res.status(200).json({
      message: "OTP sent to email",
      success: true,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

exports.verifyOtpAndUpdatePassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const [users] = await db.query(
      "SELECT * FROM users WHERE email=? AND reset_otp=? LIMIT 1",
      [email, otp]
    );

    if (!users || users.length === 0) {
      return res
        .status(400)
        .json({ message: "Invalid OTP", success: false });
    }

    const user = users[0];

    if (Date.now() > user.reset_otp_expiry) {
      return res
        .status(400)
        .json({ message: "OTP expired", success: false });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.query(
      "UPDATE users SET password=?, reset_otp=NULL, reset_otp_expiry=NULL WHERE email=?",
      [hashedPassword, email]
    );

    return res.status(200).json({
      message: "Password updated successfully",
      success: true,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

exports.dataForUpdateProfile = async (req, res) => {
  try {
    const id = req.user.id;
    const { schoolId } = req.user;

    const sql = `
     SELECT 
     u.firstname,
     u.lastname,
     u.email,
     u.role,
     s.name,
     s.profileImage,
     s.schoolLogo
      FROM users u
      LEFT JOIN user_schools us ON us.user_id = u.id
      LEFT JOIN schools s ON s.id = us.school_id
     WHERE u.id=? AND s.id=?
    `
    const [rows] = await db.query(
      sql,
      [id , schoolId]
    );


    if (rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
        success: false
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      data: rows[0],
      success: true
    });

  } catch (error) {
    console.error("❌ Fetch User Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};

exports.profile = async (req, res) => {
  try {
    const userId = req.user.id;
     const { schoolId } = req.user;
    const sql = `
      SELECT 
        u.id AS userId,
        u.firstname,
        u.lastname,
        u.email,
        u.role,
        s.profileImage
      FROM users u
      LEFT JOIN user_schools us ON us.user_id = u.id
      LEFT JOIN schools s ON s.id = us.school_id
      WHERE u.id = ? AND s.id=?
    `;

    const [rows] = await db.query(sql, [userId , schoolId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }


    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: rows[0]
    });

  } catch (error) {
    console.error("❌ Fetch User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


exports.logout = async (req, res) => {
  try {
    const id = req.user.id;

    await db.query(
      "DELETE FROM refresh_token WHERE user_id = ?",
      [id]
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,    
      sameSite: "None"
    };

    res.clearCookie("access_token", cookieOptions);
    res.clearCookie("refresh_token", cookieOptions);

    return res.status(200).json({
      message: "Logged out successfully",
      success: true
    });

  } catch (error) {
    console.error("❌ Logout Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};


exports.refreshToken = async (req, res) => {
  try {
    const { id } = req.user;
     const { schoolId } = req.user;
    const refreshToken = req.refreshToken;
    console.log(id ,schoolId)



    const [rows] = await db.query(
      `SELECT rt.expires_at, u.id, u.email, u.role
       FROM refresh_token rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.user_id = ? AND rt.token = ?
       LIMIT 1`,
      [id, refreshToken]
    );



    if (rows.length === 0) {
      return res.status(401).json({
        message: "Invalid refresh token",
        success: false
      });
    }

    const user = rows[0];

    if (new Date(user.expires_at) < new Date()) {
      return res.status(401).json({
        message: "Refresh token expired. Please login again.",
        success: false
      });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        schoolId: schoolId
      },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 15 * 60 * 1000
    });



    return res.status(200).json({
      message: "Access token refreshed successfully",
      success: true
    });

  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
};


exports.login= async (req, res) => {
  const { email, password } = req.body;

 
  const [users] = await db.query(
    `SELECT u.id, u.firstname, u.lastname, u.email, u.password, u.role
     FROM users u WHERE email = ?`,
    [email]
  );

  if (!users.length) return res.status(400).json({ success: false, message: "Invalid email or password" });

  const user = users[0];
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });


  const [schools] = await db.query(
    `SELECT s.id, s.name FROM schools s
     JOIN user_schools us ON s.id = us.school_id
     WHERE us.user_id = ?`,
    [user.id]
  );

  if (!schools.length) return res.status(403).json({ success: false, message: "No school assigned" });

  const defaultSchool = schools[0];


  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, schoolId: defaultSchool.id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign({ id: user.id, role: user.role, schoolId: defaultSchool.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

 
  await db.query(
    `INSERT INTO refresh_token (user_id, token, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
     ON DUPLICATE KEY UPDATE token=VALUES(token), expires_at=VALUES(expires_at)`,
    [user.id, refreshToken]
  );

  res.cookie("access_token", accessToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 1* 60 * 1000 });
  res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 7 * 24 * 60 * 60 * 1000 });


  res.status(200).json({
    success: true,
    message: "Login successful",
    data: { user, schools, currentSchool: defaultSchool }
  });
};

exports.switchSchool = async (req, res) => {
  const userId = req.user.id;
  const { schoolId } = req.body;
  const currentRefreshToken = req.cookies.refresh_token;

  if (!schoolId) return res.status(400).json({ success: false, message: "School ID is required" });

  const [schools] = await db.query(
    `SELECT s.id, s.name , schoolLogo
     FROM schools s
     JOIN user_schools us ON s.id = us.school_id
     WHERE us.user_id = ? AND s.id = ?`,
    [userId, schoolId]
  );

  if (!schools.length) return res.status(403).json({ success: false, message: "Access denied to this school" });

  const school = schools[0];


  if (currentRefreshToken) {
    await db.query(`DELETE FROM refresh_token WHERE user_id = ? AND token = ?`, [userId, currentRefreshToken]);
  }

 
  const accessToken = jwt.sign({ id: userId, email: req.user.email, role: req.user.role, schoolId: school.id }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });
  const refreshToken = jwt.sign({ id: userId, role: req.user.role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

  await db.query(
    `INSERT INTO refresh_token (user_id, token, expires_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))
     ON DUPLICATE KEY UPDATE token=VALUES(token), expires_at=VALUES(expires_at)`,
    [userId, refreshToken]
  );


  res.cookie("access_token", accessToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 15 * 60 * 1000 });
  res.cookie("refresh_token", refreshToken, { httpOnly: true, secure: true, sameSite: "None", maxAge: 7 * 24 * 60 * 60 * 1000 });

  return res.status(200).json({
    success: true,
    message: `Switched to school ${school.name}`,
    data: { schoolId: school.id, schoolName: school.name }
  });
};


exports.register = async (req, res) => {
  const { firstName, lastName, email, password, schoolName } = req.body;
  const profileImages = req.files.profileImage; // array
  const schoolLogos = req.files.schoolLogo;     // array

  if (!firstName?.trim() || !email?.trim() || !password?.trim() || !schoolName?.length) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const conn = await db.getConnection();
  await conn.beginTransaction();

  try {
   
    const [existingUser] = await conn.query("SELECT id FROM users WHERE email=? LIMIT 1", [email.trim()]);
    if (existingUser.length > 0) {
      await conn.rollback();
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

   
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await conn.query(
      `INSERT INTO users (firstname, lastname, email, password, role, created_at)
       VALUES (?, ?, ?, ?, 'ADMIN', NOW())`,
      [firstName.trim(), lastName?.trim() || null, email.trim(), hashedPassword]
    );
    const userId = userResult.insertId;

  
    for (let i = 0; i < schoolName.length; i++) {
      const name = schoolName[i];
      const profileImage = profileImages?.[i]?.path || null;
      const schoolLogo = schoolLogos?.[i]?.path || null;

      const [schoolResult] = await conn.query(
        `INSERT INTO schools (name, status, profileImage, schoolLogo, created_at)
         VALUES (?, 'ACTIVE', ?, ?, NOW())`,
        [name.trim(), profileImage, schoolLogo]
      );

      const schoolId = schoolResult.insertId;

      
      await conn.query(
        `INSERT INTO user_schools (user_id, school_id) VALUES (?, ?)`,
        [userId, schoolId]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "User and schools registered successfully"
    });

  } catch (error) {
    await conn.rollback();
    console.error("❌ Register Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  } finally {
    conn.release();
  }
};

exports.getUserSchools = async (req, res) => {
  const userId = req.user.id;

  try {
    const [schools] = await db.query(
      `SELECT s.id, s.name,s.schoolLogo
       FROM schools s
       JOIN user_schools us ON s.id = us.school_id
       WHERE us.user_id = ?`,
      [userId]
    );

    return res.status(200).json({
      success: true,
      data: schools
    });
  } catch (error) {
    console.error("❌ Get User Schools Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.allUsers = async (req, res) => {
  try {

    const sql = `
      SELECT 
        u.id AS usersId,
        CONCAT(u.firstname, ' ', u.lastname) AS name
      FROM users u
      WHERE u.role = 'ADMIN'
    `;

    const [rows] = await db.query(sql);

    return res.status(200).json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message,
      success: false
    });
  }
};




























