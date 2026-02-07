const db = require('../../config/db');
const allowedStatus = ['IN_PROGRESS', 'COMPLETED'];

exports.addDailyTask = async (req, res) => {
    const { class_id, month_id, task_title, status } = req.body;
    const schoolId = req.schoolId
   

    try {
       
        if (!class_id || isNaN(class_id)) {
            return res.status(400).json({ success: false, message: "Invalid class_id" });
        }

        if (!month_id || isNaN(month_id)) {
            return res.status(400).json({ success: false, message: "Invalid month_id" });
        }

        if (!task_title || typeof task_title !== "string" || !task_title.trim()) {
            return res.status(400).json({ success: false, message: "Task title is required" });
        }

        if (status && !allowedStatus.includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status" });
        }

      
        const [cls] = await db.query(
            `SELECT id FROM classes WHERE id = ?`,
            [class_id]
        );
        if (cls.length === 0) {
            return res.status(404).json({ success: false, message: "Class not found" });
        }

      
        const [month] = await db.query(
            `SELECT id FROM curriculum_months WHERE id = ?`,
            [month_id]
        );
        if (month.length === 0) {
            return res.status(404).json({ success: false, message: "Month not found" });
        }

        const sql = `
            INSERT INTO daily_tasks (class_id, month_id, task_title, status , school_id)
            VALUES (?, ?, ?, ? ,?)
        `;

        await db.query(sql, [
            class_id,
            month_id,
            task_title.trim(),
            status || 'IN_PROGRESS',
            schoolId
        ]);

        return res.status(201).json({
            success: true,
            message: "Daily task added successfully"
        });

    } catch (error) {
        console.error("Add Daily Task Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getAllDailyTasks = async (req, res) => {
    const schoolId = req.schoolId
    try {
        const sql = `
            SELECT 
                dt.id,
                c.class_name AS className,
                cm.month_no,
                cm.title,
                dt.task_title AS taskTitle,
                dt.status,
                dt.created_at
            FROM daily_tasks dt
            LEFT JOIN classes c ON c.id = dt.class_id
            LEFT JOIN curriculum_months cm ON cm.id = dt.month_id
            WHERE school_id=?
            ORDER BY dt.id DESC
        `;

        const [rows] = await db.query(sql ,[schoolId]);

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get Daily Tasks Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getDailyTaskById = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId
    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid task id" });
    }
    try {
        const sql = `
            SELECT 
                dt.id,
                dt.task_title,
                dt.status,
                cm.activity
            FROM daily_tasks dt
            LEFT JOIN curriculum_months cm ON cm.id = dt.month_id
            WHERE dt.id = ? AND dt.school_id=?
        `;

        const [rows] = await db.query(sql, [id , schoolId]);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Daily task not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: rows[0]
        });

    } catch (error) {
        console.error("Get Daily Task Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getTasksByClassAndMonth = async (req, res) => {
    const { class_id, month_id } = req.params;
    const schoolId = req.schoolId

    if (!class_id || isNaN(class_id) || !month_id || isNaN(month_id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid class_id or month_id"
        });
    }

    try {
        const sql = `
            SELECT id, task_title, status
            FROM daily_tasks
            WHERE class_id = ? AND month_id = ? AND school_id=?
            ORDER BY id ASC
        `;

        const [rows] = await db.query(sql, [class_id, month_id , schoolId]);

        return res.status(200).json({
            success: true,
            data: rows
        });

    } catch (error) {
        console.error("Get Tasks Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.updateDailyTask = async (req, res) => {
    const { id } = req.params;
    const { task_title, status } = req.body;
    const schoolId = req.schoolId

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    if (!task_title || typeof task_title !== "string" || !task_title.trim()) {
        return res.status(400).json({ success: false, message: "Task title is required" });
    }

    if (!allowedStatus.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
    }

    try {
        const sql = `
            UPDATE daily_tasks
            SET task_title = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND school_id=?
        `;

        const [result] = await db.query(sql, [
            task_title.trim(),
            status,
            id,
            schoolId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Daily task not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Daily task updated successfully"
        });

    } catch (error) {
        console.error("Update Daily Task Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.deleteDailyTask = async (req, res) => {
    const { id } = req.params;
    const schoolId = req.schoolId

    if (!id || isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid task id" });
    }

    try {
        const [result] = await db.query(
            `DELETE FROM daily_tasks WHERE id = ? AND school_id=?`,
            [id , schoolId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Daily task not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Daily task deleted successfully"
        });

    } catch (error) {
        console.error("Delete Daily Task Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

exports.getClassProgressData = async (req, res) => {
    const { class_id } = req.params;
    const schoolId = req.schoolId

    if (!class_id || isNaN(class_id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid class_id"
        });
    }

    try {
        // Get total tasks and completed tasks for the class
        const sql = `
            SELECT 
                COUNT(*) AS totalTasks,
                SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTasks
            FROM daily_tasks
            WHERE class_id = ? AND school_id=?
        `;

        const [rows] = await db.query(sql, [class_id , schoolId]);

        const totalTasks = rows[0].totalTasks || 0;
        const completedTasks = Number(rows[0].completedTasks) || 0;

        // Calculate percentage (avoid division by 0)
        const completionPercent = totalTasks > 0 
            ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2)) 
            : 0;

        return res.status(200).json({
            success: true,
            data: {
                totalTasks,
                completedTasks,
                completionPercent
            },
            message: "Class progress fetched successfully"
        });

    } catch (error) {
        console.error("Get Progress Data Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.getAllClassesProgress = async (req, res) => {
    const schoolId = req.schoolId
  try {
    // Step 1: Get all classes
    const [classes] = await db.query(`SELECT id, class_name FROM classes ORDER BY id ASC`);

    if (classes.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No classes found"
      });
    }

    const progressPromises = classes.map(async (cls) => {
      const [rows] = await db.query(
        `
        SELECT 
          COUNT(*) AS totalTasks,
          SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedTasks
        FROM daily_tasks
        WHERE class_id = ? AND school_id=?
        ORDER BY class_id
        `,
        [cls.id , schoolId]
      );

      const totalTasks = rows[0].totalTasks || 0;
      const completedTasks = rows[0].completedTasks || 0;
      const completionPercent = totalTasks > 0
        ? parseFloat(((completedTasks / totalTasks) * 100).toFixed(2))
        : 0;

      return {
        classId: cls.id,
        className: cls.class_name,
        totalTasks,
        completedTasks,
        completionPercent
      };
    });

    const progressData = await Promise.all(progressPromises); // Parallel execution

    return res.status(200).json({
      success: true,
      data: progressData,
      message: "All classes progress fetched successfully"
    });

  } catch (error) {
    console.error("Get All Classes Progress Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};




// import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";
// import axios from "axios";

// const ClassesProgressChart = () => {
//   const [progressData, setProgressData] = useState<{ className: string; completionPercent: number }[]>([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchProgress = async () => {
//       try {
//         const { data } = await axios.get("/api/daily-tasks/progress/all"); // your backend endpoint
//         if (data.success) {
//           // Only need className + percentage for chart
//           const chartData = data.data.map((cls: any) => ({
//             className: cls.className,
//             completionPercent: cls.completionPercent
//           }));
//           setProgressData(chartData);
//         }
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProgress();
//   }, []);

//   if (loading) return <p>Loading chart...</p>;

//   const options = {
//     chart: {
//       type: "bar",
//       height: 350
//     },
//     plotOptions: {
//       bar: {
//         horizontal: false,
//         columnWidth: "50%",
//         dataLabels: {
//           position: "top"
//         }
//       }
//     },
//     dataLabels: {
//       enabled: true,
//       formatter: (val: number) => `${val}%`,
//       offsetY: -20,
//       style: {
//         fontSize: "12px",
//         colors: ["#304758"]
//       }
//     },
//     xaxis: {
//       categories: progressData.map((cls) => cls.className)
//     },
//     yaxis: {
//       max: 100,
//       title: {
//         text: "Completion %"
//       }
//     },
//     tooltip: {
//       y: {
//         formatter: (val: number) => `${val}%`
//       }
//     }
//   };

//   const series = [
//     {
//       name: "Completion %",
//       data: progressData.map((cls) => cls.completionPercent)
//     }
//   ];

//   return <ReactApexChart options={options} series={series} type="bar" height={350} />;
// };

// export default ClassesProgressChart;

