const db = require('../../../config/db');

exports.addDevice = async (req, res) => {
    const { category_id, sub_category_id, device_name, device_code, quantity } = req.body;
      const schoolId =  req.schoolId
    console.log(quantity)
    try {
        // Validation
        if (!category_id || isNaN(category_id)) throw "Invalid category ID";
        if (!sub_category_id || isNaN(sub_category_id)) throw "Invalid sub-category ID";
        if (!device_name || !device_name.trim()) throw "Device name is required";
        if (!device_code || !device_code.trim()) throw "Device code is required";
        if (!quantity || quantity < 0) throw "Invalid quantity";

        // Check if category exists
        const [cat] = await db.query(`SELECT id FROM ai_category WHERE id = ?`, [category_id]);
        if (cat.length === 0) return res.status(404).json({ success: false, message: "Category not found" });

        // Check if sub-category exists
        const [sub] = await db.query(
            `SELECT id FROM ai_sub_categories WHERE id = ? AND category_id = ?`,
            [sub_category_id, category_id]
        );
        if (sub.length === 0) return res.status(404).json({ success: false, message: "Sub-Category not found" });

        // Insert device
        const sql = `INSERT INTO ai_devices (device_name, device_code, category_id, sub_category_id, quantity , school_id) 
                     VALUES (?, ?, ?, ?, ?,?)`;
        await db.query(sql, [device_name.trim(), device_code.trim(), category_id, sub_category_id, quantity , schoolId]);

        return res.status(201).json({ success: true, message: "Device added successfully" });

    } catch (error) {
        console.error("Add Device Error:", error);
        return res.status(400).json({
            success: false,
            message: typeof error === "string" ? error : "Internal server error"
        });
    }
};

exports.getAllDevices = async (req, res) => {
      const schoolId =  req.schoolId
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
        ` ,[schoolId]);

        res.status(200).json({ success: true, data: devices });

    } catch (error) {
        console.error("Get Devices Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getDeviceById = async (req, res) => {
    const { id } = req.params;
      const schoolId =  req.schoolId

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
            FROM ai_devices d
            WHERE d.id = ? AND d.school_id=?
        `, [id , schoolId]);

        if (device.length === 0)
            return res.status(404).json({ success: false, message: "Device not found" });

        res.status(200).json({ success: true, data: device[0] });

    } catch (error) {
        console.error("Get Device Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};

exports.updateDevice = async (req, res) => {
    const { id } = req.params;
    const { category_id, sub_category_id, device_name, device_code, quantity } = req.body;
      const schoolId =  req.schoolId

    try {
        if (!id || isNaN(id)) throw "Invalid device ID";
        if (!device_name || !device_name.trim()) throw "Device name is required";
        if (!device_code || !device_code.trim()) throw "Device code is required";
        if (quantity == null || isNaN(quantity) || quantity < 0) throw "Invalid quantity";

        const [existing] = await db.query(`SELECT id FROM ai_devices WHERE id = ?`, [id]);
        if (existing.length === 0)
            return res.status(404).json({ success: false, message: "Device not found" });

        // Update device
        await db.query(`
            UPDATE ai_devices SET
                device_name = ?,
                device_code = ?,
                category_id = ?,
                sub_category_id = ?,
                quantity = ?
            WHERE id = ? AND school_id=?
        `, [
            device_name.trim(),
            device_code.trim(),
            category_id,
            sub_category_id,
            quantity,
            id,
            schoolId
        ]);

        res.status(200).json({ success: true, message: "Device updated successfully" });

    } catch (error) {
        console.error("Update Device Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};

exports.deleteDevice = async (req, res) => {
    const { id } = req.params;
      const schoolId =  req.schoolId
      console.log(id,schoolId)

    try {
        if (!id || isNaN(id)) throw "Invalid device ID";

        const [device] = await db.query(`SELECT id FROM ai_devices WHERE id = ? AND school_id=?`, [id , schoolId]);
       
        if (device.length === 0)
            return res.status(404).json({ success: false, message: "Device not found" });

        await db.query(`DELETE FROM ai_devices WHERE id = ? AND school_id=?`, [id , schoolId]);

        res.status(200).json({ success: true, message: "Device deleted successfully" });

    } catch (error) {
        console.error("Delete Device Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};


exports.OutOfStockDevices = async (req, res) => {
    const schoolId = req.schoolId
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
            
        ` ,[schoolId]);
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

exports.addQuantityInDevice = async (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
      const schoolId = req.schoolId

 
    if (!id || isNaN(id)) {
        return res.status(400).json({ message: "Invalid device ID!", success: false });
    }


    try {
        const sql = `UPDATE ai_devices SET quantity = quantity + ? WHERE id = ? AND school_id=?`;
        await db.query(sql, [quantity, id , schoolId]);

        return res.status(200).json({
            message: `Successfully mannage units for this device!`,
            success: true,
        });

    } catch (error) {
        console.error("Add Quantity Error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
        });
    }
};


exports.deviceTypeCount = async (req, res) => {
      const schoolId = req.schoolId
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

        const [rows] = await db.query(sql ,[schoolId]);

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


