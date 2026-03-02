const db = require('../../config/db');

// ✅ Add a new topic
exports.addTopic = async (req, res) => {
    const { title, description } = req.body;
    try {
        if (!title?.trim()) throw "Title is required!";
        if (!description?.trim()) throw "Description is required!";

        const sql = `
            INSERT INTO topics (title, description)
            VALUES (?, ?)
        `;
        await db.query(sql, [title.trim(), description.trim()]);

        return res.status(201).json({ success: true, message: "Topic added successfully" });

    } catch (error) {
        console.error("Add Topic Error:", error);
        return res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};


exports.getAllTopics = async (req, res) => {
    try {
        const [topics] = await db.query(`
            SELECT id, title, description, created_at
            FROM topics
            ORDER BY created_at DESC
        `);

        res.status(200).json({ success: true, data: topics });

    } catch (error) {
        console.error("Get Topics Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getNewestTopics = async (req, res) => {
    try {
        const [topics] = await db.query(`
            SELECT id, title, description
            FROM topics
            ORDER BY created_at DESC
            LIMIT 5
        `);

        res.status(200).json({ success: true, data: topics });

    } catch (error) {
        console.error("Get Topics Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getTopicById = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id || isNaN(id)) throw "Invalid topic ID";

        const [topic] = await db.query(`
            SELECT id, title, description
            FROM topics
            WHERE id = ?
        `, [id]);

        if (topic.length === 0) return res.status(404).json({ success: false, message: "Topic not found" });

        res.status(200).json({ success: true, data: topic[0] });

    } catch (error) {
        console.error("Get Topic Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};


exports.updateTopic = async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;

    try {
        if (!id || isNaN(id)) throw "Invalid topic ID";
        if (!title?.trim()) throw "Title is required!";
        if (!description?.trim()) throw "Description is required!";

        // Check if topic exists
        const [existingTopic] = await db.query(`SELECT id FROM topics WHERE id = ?`, [id]);
        if (existingTopic.length === 0) throw "Topic not found";

        // Update topic
        const sql = `
            UPDATE topics
            SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;
        await db.query(sql, [title.trim(), description.trim(), id]);

        res.status(200).json({ success: true, message: "Topic updated successfully" });

    } catch (error) {
        console.error("Update Topic Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};


exports.deleteTopic = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id || isNaN(id)) throw "Invalid topic ID";
        const [existingTopic] = await db.query(`SELECT id FROM topics WHERE id = ?`, [id]);
        if (existingTopic.length === 0) throw "Topic not found";
        await db.query(`DELETE FROM topics WHERE id = ?`, [id]);

        res.status(200).json({ success: true, message: "Topic deleted successfully" });

    } catch (error) {
        console.error("Delete Topic Error:", error);
        res.status(400).json({ success: false, message: typeof error === "string" ? error : "Internal server error" });
    }
};