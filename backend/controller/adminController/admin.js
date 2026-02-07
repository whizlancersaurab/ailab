const db = require('../../config/db')

exports.devicesCount = async (req, res) => {
    const schoolId = req.schoolId
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

exports.TotaldeviceTypeCount = async (req, res) => {
    const schoolId = req.schoolId;
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

exports.getOutOfStockDeviceCount = async (req, res) => {
    const schoolId = req.schoolId;
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


