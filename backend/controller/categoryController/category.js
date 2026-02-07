
const db = require('../../config/db')

exports.addCategory = async (req, res) => {
  const { category } = req.body
   const schoolId = req.schoolId;

  try {
    if (!category || typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      })
    }

    if (category.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: "Category name must be at least 3 characters",
      })
    }

    const [existing] = await db.query(
      `SELECT id FROM category WHERE LOWER(category) = LOWER(?) AND school_id=?`,
      [category.trim() , schoolId]
    )

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      })
    }

    const sql = `INSERT INTO category (category , school_id) VALUES (? ,?)`
    await db.query(sql, [category.trim() , schoolId])

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
    })
  } catch (error) {
    console.error("Add Category Error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
}


exports.getCategories = async (req, res) => {
const schoolId = req.schoolId
  try {
    const sql = `
      SELECT 
        id,
        UPPER(category) AS category
      FROM category
      WHERE school_id=?
      ORDER BY id DESC
    `

    const [rows] = await db.query(sql ,[schoolId])

    return res.status(200).json({
      success: true,
      data: rows,
    })
  } catch (error) {
    console.error("Get Categories Error:", error)
    return res.status(500).json({
      success: false,
      message: "Error while fetching categories",
    })
  }
}


exports.getCategoryById = async (req, res) => {
  const { id } = req.params
  const schoolId = req.schoolId

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      })
    }

    const sql = `
      SELECT 
        id,
        category
      FROM category
      WHERE id = ? AND school_id=?
    `

    const [rows] = await db.query(sql, [id , schoolId])

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    return res.status(200).json({
      success: true,
      data: rows[0],
    })
  } catch (error) {
    console.error("Get Category Error:", error)
    return res.status(500).json({
      success: false,
      message: "Error while fetching category",
    })
  }
}


exports.updateCategory = async (req, res) => {
  const { id } = req.params
  const { category } = req.body
  const schoolId = req.schoolId

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      })
    }

    if (!category || typeof category !== "string" || !category.trim()) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      })
    }

    const [duplicate] = await db.query(
      `SELECT id FROM category WHERE LOWER(category) = LOWER(?) AND school_id=? AND id != ?`,
      [category.trim(), schoolId, id]
    )

    if (duplicate.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Category already exists",
      })
    }

    const sql = `
      UPDATE category 
      SET category = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND school_id=?
    `

    const [result] = await db.query(sql, [category.trim(), id , schoolId])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
    })
  } catch (error) {
    console.error("Update Category Error:", error)
    return res.status(500).json({
      success: false,
      message: "Error while updating category",
    })
  }
}


exports.deleteCategory = async (req, res) => {
  const { id } = req.params
  const schoolId = req.schoolId

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      })
    }

    const sql = `DELETE FROM category WHERE id = ? AND school_id=?`
    const [result] = await db.query(sql, [id , schoolId])

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      })
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    })
  } catch (error) {
    console.error("Delete Category Error:", error)
    return res.status(500).json({
      success: false,
      message: "Error while deleting category",
    })
  }
}


exports.categoryForOption = async (req, res) => {
  const schoolId = req.schoolId
  try {
    const sql = `SELECT id, category FROM category WHERE school_id=?`
    const [rows] = await db.query(sql ,[schoolId])

    res.status(200).json({
      success: true,
      message: "All category for option!",
      data: rows,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Internal server error!",
    })
  }
}
