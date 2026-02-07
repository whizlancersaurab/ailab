const db = require('../../config/db');


// ===================== ADD SUB CATEGORY =====================
exports.addSubCategory = async (req, res) => {
  const { category_id, subCategories } = req.body;
  const schoolId = req.schoolId;

  try {
    if (!category_id || isNaN(category_id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    if (!Array.isArray(subCategories) || subCategories.length === 0) {
      return res.status(400).json({ success: false, message: "SubCategories are required" });
    }

    // ✅ Category must belong to same school
    const [categoryCheck] = await db.query(
      `SELECT id FROM category WHERE id=? AND school_id=?`,
      [category_id, schoolId]
    );

    if (!categoryCheck.length) {
      return res.status(404).json({ success: false, message: "Category not found for this school" });
    }

    const values = [];

    for (const sub of subCategories) {
      const name = sub?.trim();
      if (!name) continue;

      const [existing] = await db.query(
        `SELECT id FROM sub_categories
         WHERE category_id=? AND LOWER(sub_category_name)=LOWER(?) AND school_id=?`,
        [category_id, name, schoolId]
      );

      if (!existing.length) {
        values.push([category_id, name, schoolId]);
      }
    }

    if (!values.length) {
      return res.status(409).json({
        success: false,
        message: "All sub-categories already exist",
      });
    }

    await db.query(
      `INSERT INTO sub_categories (category_id, sub_category_name, school_id) VALUES ?`,
      [values]
    );

    return res.status(201).json({
      success: true,
      message: "SubCategories added successfully",
    });

  } catch (error) {
    console.error("Add SubCategory Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ===================== ALL SUB CATEGORIES =====================
exports.allSubCategories = async (req, res) => {
  const schoolId = req.schoolId;

  try {
    const [rows] = await db.query(
      `
      SELECT 
        sc.id,
        sc.sub_category_name AS sub_category,
        c.category
      FROM sub_categories sc
      JOIN category c 
        ON c.id = sc.category_id 
       AND c.school_id = sc.school_id
      WHERE sc.school_id = ?
      ORDER BY sc.id DESC
      `,
      [schoolId]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ===================== SUB CATEGORY BY CATEGORY =====================
exports.getSubCategoriesByCategory = async (req, res) => {
  const { id } = req.params;
  const schoolId = req.schoolId;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const [rows] = await db.query(
      `
      SELECT id, sub_category_name
      FROM sub_categories
      WHERE category_id=? AND school_id=?
      ORDER BY id DESC
      `,
      [id, schoolId]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Get SubCategories Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ===================== GET SINGLE SUB CATEGORY =====================
exports.getSpeSubCategory = async (req, res) => {
  const { id } = req.params;
  const schoolId = req.schoolId;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid sub-category ID" });
    }

    const [rows] = await db.query(
      `
      SELECT id, sub_category_name
      FROM sub_categories
      WHERE id=? AND school_id=?
      `,
      [id, schoolId]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "SubCategory not found" });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ===================== UPDATE SUB CATEGORY =====================
exports.updateSubCategory = async (req, res) => {
  const { id } = req.params;
  const { sub_category_name } = req.body;
  const schoolId = req.schoolId;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid sub-category ID" });
    }

    if (!sub_category_name?.trim()) {
      return res.status(400).json({ success: false, message: "Sub-category name is required" });
    }

    const [duplicate] = await db.query(
      `
      SELECT id FROM sub_categories
      WHERE LOWER(sub_category_name)=LOWER(?)
        AND id!=?
        AND school_id=?
      `,
      [sub_category_name.trim(), id, schoolId]
    );

    if (duplicate.length) {
      return res.status(409).json({ success: false, message: "Sub-category already exists" });
    }

    const [result] = await db.query(
      `
      UPDATE sub_categories
      SET sub_category_name=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=? AND school_id=?
      `,
      [sub_category_name.trim(), id, schoolId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "SubCategory not found" });
    }

    return res.status(200).json({ success: true, message: "SubCategory updated successfully" });

  } catch (error) {
    console.error("Update SubCategory Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// ===================== DELETE SUB CATEGORY =====================
exports.deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  const schoolId = req.schoolId;

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid sub-category ID" });
    }

    const [result] = await db.query(
      `DELETE FROM sub_categories WHERE id=? AND school_id=?`,
      [id, schoolId]
    );

    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "SubCategory not found" });
    }

    return res.status(200).json({ success: true, message: "SubCategory deleted successfully" });

  } catch (error) {
    console.error("Delete SubCategory Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
