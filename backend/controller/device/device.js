const db = require('../../config/db');

// ✅ Add new device
exports.addDevice = async (req, res) => {
    const { category_id, sub_category_id, device_name, device_code, quantity } = req.body;
    const schoolId = req.schoolId;

    try {
        // Validation
        if (!category_id || isNaN(category_id)) throw "Invalid category ID";
        if (!sub_category_id || isNaN(sub_category_id)) throw "Invalid sub-category ID";
        if (!device_name?.trim()) throw "Device name is required";
        if (!device_code?.trim()) throw "Device code is required";
        if (!Number.isInteger(quantity) || quantity < 0) throw "Invalid quantity";

        // Check if category exists
        const [cat] = await db.query(`SELECT id FROM category WHERE id = ?`, [category_id]);
        if (cat.length === 0) throw "Category not found";

        // Check if sub-category exists
        const [sub] = await db.query(
            `SELECT id FROM sub_categories WHERE id = ? AND category_id = ?`,
            [sub_category_id, category_id]
        );
        if (sub.length === 0) throw "Sub-category not found";

        // Insert device
        const sql = `
            INSERT INTO devices (device_name, device_code, category_id, sub_category_id, quantity, school_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await db.query(sql, [device_name.trim(), device_code.trim(), category_id, sub_category_id, quantity, schoolId]);

        return res.status(201).json({ success: true, message: "Device added successfully" });

    } catch (error) {
        console.error("Add Device Error:", error);
        return res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};

// ✅ Get all devices for the school
exports.getAllDevices = async (req, res) => {
    const schoolId = req.schoolId;
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

// ✅ Get device by ID (school-restricted)
exports.getDeviceById = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;

    try {
        if (!id || isNaN(id)) throw "Invalid device ID";

        const [device] = await db.query(`
            SELECT 
                d.id,
                d.device_name,
                d.device_code,
                d.quantity,
                d.category_id,
                d.sub_category_id
            FROM devices d
            WHERE d.id = ? AND d.school_id = ?
        `, [id, schoolId]);

        if (device.length === 0)
            return res.status(404).json({ success: false, message: "Device not found" });

        res.status(200).json({ success: true, data: device[0] });

    } catch (error) {
        console.error("Get Device Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};

// ✅ Update device (school-restricted)
exports.updateDevice = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;
    const { category_id, sub_category_id, device_name, device_code, quantity } = req.body;

    try {
        if (!id || isNaN(id)) throw "Invalid device ID";
        if (!device_name?.trim()) throw "Device name is required";
        if (!device_code?.trim()) throw "Device code is required";
        if (!Number.isInteger(quantity) || quantity < 0) throw "Invalid quantity";

        // Check existence with schoolId
        const [existing] = await db.query(`SELECT id FROM devices WHERE id = ? AND school_id = ?`, [id, schoolId]);
        if (existing.length === 0) throw "Device not found";

        // Validate category/sub-category
        const [cat] = await db.query(`SELECT id FROM category WHERE id = ?`, [category_id]);
        if (cat.length === 0) throw "Category not found";

        const [sub] = await db.query(
            `SELECT id FROM sub_categories WHERE id = ? AND category_id = ?`,
            [sub_category_id, category_id]
        );
        if (sub.length === 0) throw "Sub-category not found";

        // Update
        await db.query(`
            UPDATE devices SET
                device_name = ?,
                device_code = ?,
                category_id = ?,
                sub_category_id = ?,
                quantity = ?
            WHERE id = ? AND school_id = ?
        `, [device_name.trim(), device_code.trim(), category_id, sub_category_id, quantity, id, schoolId]);

        res.status(200).json({ success: true, message: "Device updated successfully" });

    } catch (error) {
        console.error("Update Device Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};

// ✅ Delete device (school-restricted)
exports.deleteDevice = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;

    try {
        if (!id || isNaN(id)) throw "Invalid device ID";

        const [device] = await db.query(`SELECT id FROM devices WHERE id = ? AND school_id = ?`, [id, schoolId]);
        if (device.length === 0) throw "Device not found";

        await db.query(`DELETE FROM devices WHERE id = ? AND school_id = ?`, [id, schoolId]);

        res.status(200).json({ success: true, message: "Device deleted successfully" });

    } catch (error) {
        console.error("Delete Device Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};

// ✅ Out-of-stock devices
exports.OutOfStockDevices = async (req, res) => {
    const schoolId = req.schoolId;

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

// ✅ Add quantity to device
exports.addQuantityInDevice = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId;
    const { quantity } = req.body;

    if (!id || isNaN(id)) return res.status(400).json({ success: false, message: "Invalid device ID!" });
    // if (!Number.isInteger(quantity) || quantity <= 0) return res.status(400).json({ success: false, message: "Invalid quantity!" });

    try {
        const [existing] = await db.query(`SELECT id FROM devices WHERE id = ? AND school_id = ?`, [id, schoolId]);
        if (existing.length === 0) throw "Device not found";

        await db.query(`UPDATE devices SET quantity = quantity + ? WHERE id = ? AND school_id = ?`, [quantity, id, schoolId]);

        res.status(200).json({ success: true, message: "Successfully managed units for this device!" });

    } catch (error) {
        console.error("AddQuantityInDevice Error:", error);
        res.status(500).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};

// ✅ Device type & subcategory count
exports.deviceTypeCount = async (req, res) => {
    const schoolId = req.schoolId;

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
