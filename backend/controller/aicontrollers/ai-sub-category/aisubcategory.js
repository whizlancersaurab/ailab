const db = require('../../../config/db');

exports.addSubCategory = async (req, res) => {
  const { category_id, subCategories } = req.body;
  const schoolId = req.schoolId

  try {
    if (!category_id || isNaN(category_id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    if (!subCategories || !Array.isArray(subCategories) || subCategories.length === 0) {
      return res.status(400).json({ success: false, message: "SubCategories are required" });
    }

    // ✅ category table updated
    const [categoryCheck] = await db.query(
      `SELECT id FROM ai_category WHERE id = ?`,
      [category_id]
    );

    if (categoryCheck.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const values = [];

    for (let i = 0; i < subCategories.length; i++) {
      const name = subCategories[i].trim();
      if (!name) continue;

      // ✅ sub category table updated
      const [existing] = await db.query(
        `SELECT id FROM ai_sub_categories 
         WHERE category_id = ? AND LOWER(sub_category_name) = LOWER(?) AND school_id=?`,
        [category_id, name, schoolId]
      );

      if (existing.length === 0) {
        values.push([category_id, name, schoolId]);
      }
    }

    if (values.length === 0) {
      return res.status(409).json({
        success: false,
        message: "All sub-categories already exist",
      });
    }

    const sql = `
      INSERT INTO ai_sub_categories (category_id, sub_category_name , school_id)
      VALUES ?
    `;
    await db.query(sql, [values]);

    return res.status(201).json({
      success: true,
      message: "SubCategories added successfully",
    });

  } catch (error) {
    console.error("Add SubCategory Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.allSubCategories = async (req, res) => {
  const schoolId = req.schoolId
  try {
    const sql = `
      SELECT 
        sc.id,
        sc.sub_category_name AS sub_category,
        c.category
      FROM ai_sub_categories sc
      LEFT JOIN ai_category c ON sc.category_id = c.id
      WHERE sc.school_id=?
      ORDER BY sc.id DESC
    `;

    const [rows] = await db.query(sql, [schoolId]);
    return res.status(200).json({ data: rows, success: true });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

exports.getSubCategoriesByCategory = async (req, res) => {
  const { id } = req.params;
  const schoolId = req.schoolId

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const sql = `
      SELECT id, sub_category_name
      FROM ai_sub_categories
      WHERE category_id = ? AND school_id=?
      ORDER BY id DESC
    `;
    const [rows] = await db.query(sql, [id, schoolId]);

    return res.status(200).json({ success: true, data: rows });

  } catch (error) {
    console.error("Get SubCategories Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getSpeSubCategory = async (req, res) => {
  const { id } = req.params;
  const schoolId = req.schoolId

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid sub-category ID",
      });
    }

    const sql = `
      SELECT id, sub_category_name
      FROM ai_sub_categories
      WHERE id = ? AND school_id=?
    `;

    const [rows] = await db.query(sql, [id, schoolId]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message, success: false });
  }
};

exports.updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { sub_category_name } = req.body;
  const schoolId = req.schoolId

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid sub-category ID" });
    }

    if (!sub_category_name || !sub_category_name.trim()) {
      return res.status(400).json({ success: false, message: "Sub-category name is required" });
    }

    const [duplicate] = await db.query(
      `SELECT id FROM ai_sub_categories 
       WHERE LOWER(sub_category_name) = LOWER(?) AND school_id=? AND id != ?`,
      [sub_category_name.trim(), schoolId, id]
    );

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Sub-category already exists",
      });
    }

    const sql = `
      UPDATE ai_sub_categories
      SET sub_category_name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND school_id=?
    `;

    const [result] = await db.query(sql, [sub_category_name.trim(), id, schoolId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SubCategory updated successfully",
    });

  } catch (error) {
    console.error("Update SubCategory Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  const schoolId = req.schoolId

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid sub-category ID" });
    }

    const sql = `DELETE FROM ai_sub_categories WHERE id = ? AND school_id=?`;
    const [result] = await db.query(sql, [id, schoolId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "SubCategory not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "SubCategory deleted successfully",
    });

  } catch (error) {
    console.error("Delete SubCategory Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
