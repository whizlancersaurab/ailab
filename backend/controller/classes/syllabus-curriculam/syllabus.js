const db = require('../../../config/db');
const xlsx = require("xlsx");
// const puppeteer = require("puppeteer");
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


exports.downloadSyllabusPDF = async (req, res) => {
    const { schoolId } = req.params;

    try {

        const [[school]] = await db.query(
            `SELECT name, schoolLogo FROM schools WHERE id=? LIMIT 1`,
            [schoolId]
        );

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found",
            });
        }

        const [rows] = await db.query(`
            SELECT c.class_name, s.month_no, s.title, s.activity, s.description, s.status
            FROM curriculum_months s
            LEFT JOIN classes c ON c.id = s.class_id
            WHERE s.school_id=?
            ORDER BY c.id ASC, s.month_no ASC
        `, [schoolId]);

        if (!rows.length) {
            return res.status(404).json({
                success: false,
                message: "No syllabus found",
            });
        }

        const grouped = {};
        rows.forEach(item => {
            if (!grouped[item.class_name]) grouped[item.class_name] = [];
            grouped[item.class_name].push(item);
        });



        const html = `
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 30px;
                    background: #f4f6f8;
                }

                .header {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 2px solid #4a90e2;
                    padding-bottom: 10px;
                    margin-bottom: 20px;
                }

                .logo {
                    height: 60px;
                }

                .school-name {
                    font-size: 20px;
                    font-weight: bold;
                }

                .report-title {
                    font-size: 14px;
                    color: #666;
                }

                .class-card {
                    margin-top: 20px;
                    background: #fff;
                    padding: 20px;
                    border-radius: 10px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }

                .class-title {
                    font-size: 18px;
                    font-weight: bold;
                    color: #4a90e2;
                    margin-bottom: 10px;
                }

                .month {
                    border-top: 1px solid #eee;
                    padding: 10px 0;
                }

                .badge {
                    padding: 4px 8px;
                    border-radius: 5px;
                    color: #fff;
                    font-size: 12px;
                }

                .COMPLETED { background: #28a745; }
                .IN_PROGRESS { background: #007bff; }
                .ON_HOLD { background: #ffc107; color:#000; }
                .PENDING { background: #6c757d; }

            </style>
        </head>

        <body>

            <div class="header">
                <img src="${school.schoolLogo}" class="logo"/>
                <div>
                    <div class="school-name">${school.name}</div>
                    <div class="report-title">📘 Syllabus Report</div>
                </div>
            </div>

            ${Object.keys(grouped).map(className => `
                <div class="class-card">
                    <div class="class-title">Class ${className}</div>

                    ${grouped[className].map(item => `
                        <div class="month">
                            <strong>Month ${item.month_no}</strong>
                            <div><b>Title:</b> ${item.title || '-'}</div>
                            <div><b>Activity:</b> ${item.activity}</div>
                            <div><b>Description:</b> ${item.description}</div>
                            <div>
                                <span class="badge ${item.status}">
                                    ${item.status}
                                </span>
                            </div>
                        </div>
                    `).join("")}

                </div>
            `).join("")}

        </body>
        </html>
        `;

        // ✅ 6. Generate PDF
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox"]
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true
        });

        await browser.close();

        // ✅ 7. Send PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=syllabus.pdf");

        return res.send(pdfBuffer);

    } catch (error) {
        console.error("PDF Error:", error);
        return res.status(500).json({
            success: false,
            message: "PDF generation failed",
        });
    }
};


// const pdfParse = require("pdf-parse");


// ------------------- PDF Parsing Function -------------------
const parseFullSyllabus = (text) => {
    const classes = [];
    const classMatches = [...text.matchAll(/Class:\s*(\d+)/g)];

    const classBlocks = text.split(/Class:\s*\d+/).filter(b => b.trim() !== "");

    classBlocks.forEach((block, idx) => {
        const class_id = Number(classMatches[idx][1]);
        const months = [];

        const monthMatches = [...block.matchAll(/Month:\s*(\d+)/g)];
        const monthBlocks = block.split(/Month:\s*\d+/).filter(b => b.trim() !== "");

        monthBlocks.forEach((mBlock, mIdx) => {
            const month_no = Number(monthMatches[mIdx][1]);
            const title = mBlock.match(/Title:\s*(.*)/)?.[1]?.trim() || "";
            const activity = mBlock.match(/Activity:\s*(.*)/)?.[1]?.trim() || "";
            const description = mBlock.match(/Description:\s*(.*)/)?.[1]?.trim() || "";

            months.push({
                month_no,
                title,
                activity,
                description,
                status: "PENDING"
            });
        });

        classes.push({ class_id, months });
    });

    return classes;
};

exports.addClassSyllabusViaPdf = () => async (req, res) => {
    const schoolId = Number(req.params.schoolId);
    if (!req.file) return res.status(400).json({ success: false, message: "PDF file missing" });

    try {
        // PDF text extraction
        const dataBuffer = req.file.buffer;
        const pdfData = await pdfParse(dataBuffer);
        const classesData = parseFullSyllabus(pdfData.text);

        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            const sql = `
                INSERT INTO curriculum_months 
                (school_id, class_id, month_no, title, activity, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;

            for (let cls of classesData) {
                for (let m of cls.months) {
                    // Duplicate check
                    const [existing] = await connection.query(
                        `SELECT id FROM curriculum_months WHERE school_id=? AND class_id=? AND month_no=?`,
                        [schoolId, cls.class_id, m.month_no]
                    );
                    if (existing.length > 0) continue; // skip duplicate

                    await connection.query(sql, [
                        schoolId,
                        cls.class_id,
                        m.month_no,
                        m.title,
                        m.activity,
                        m.description,
                        m.status
                    ]);
                }
            }

            await connection.commit();
            connection.release();

            return res.json({ success: true, message: "Syllabus uploaded successfully" });
        } catch (err) {
            await connection.rollback();
            connection.release();
            console.error(err);
            return res.status(500).json({ success: false, message: err.message });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

const parseExcelSyllabus = (rows) => {
    const classes = [];
    const classMap = {};

    rows.forEach(row => {
        const { Class: class_id, Month: month_no, Title: title, Activity: activity, Description: description } = row;
        if (!classMap[class_id]) classMap[class_id] = { class_id, months: [] };
        classMap[class_id].months.push({
            month_no,
            title: title?.trim(),
            activity: activity?.trim(),
            description: description?.trim(),
            status: "PENDING"
        });
    });

    return Object.values(classMap);
};

exports.addClassSyllabusViaExcel = async (req, res) => {
    
    try {
        const schoolId = Number(req.params.schoolId);
        if (!req.file) return res.status(400).json({ success: false, message: "Excel file missing" });

        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = xlsx.utils.sheet_to_json(sheet);
        const classesData = parseExcelSyllabus(rows);
        const connection = await db.getConnection();
        await connection.beginTransaction();

        const sql = `
            INSERT INTO curriculum_months 
            (school_id, class_id, month_no, title, activity, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        for (let cls of classesData) {
            for (let m of cls.months) {
                const [existing] = await connection.query(
                    `SELECT id FROM curriculum_months WHERE school_id=? AND class_id=? AND month_no=?`,
                    [schoolId, cls.class_id, m.month_no]
                );
                if (existing.length > 0) continue;

                await connection.query(sql, [
                    schoolId,
                    cls.class_id,
                    m.month_no,
                    m.title,
                    m.activity,
                    m.description,
                    m.status
                ]);
            }
        }

        await connection.commit();
        connection.release();

        return res.status(200).json({ success: true, message: "Excel syllabus uploaded successfully" });

    } catch (err) {
        console.error("Error uploading syllabus Excel:", err);
        return res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
    }
};

