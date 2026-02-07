const express = require('express')
const cors = require('cors');
const { authMiddleware, refreshTokenMidddlware } = require('./middleware/auth');
const cookieParser = require('cookie-parser');
require('dotenv').config()



const app = express()
app.use(cors({
    origin: process.env.CORS_URL,
    methods: ["GET", "POST", "PUT", "DELETE", 'PATCH'],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


const publicRoutes = [
    '/api/auth/login',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',

];

app.use((req, res, next) => {
    try {
        
        const path = req.path;
        if (publicRoutes.includes(path)) {
            return next();
        }
        if (['/api/auth/refresh', '/api/auth/logout'].includes(path)) {
            return refreshTokenMidddlware(req, res, next);
        }
        return authMiddleware(req, res, next);
    } catch (err) {
        console.error("Global Middleware Error:", err);
        return res.status(500).json({ success: false, message: "Something went wrong" });
    }
});


app.use((err, req, res, next) => {
    console.error("Server Error:", err.stack);
    res.status(500).json({ message: "Something went wrong on the server" });
});

// apis====================================================================

// common
app.use('/api/auth', require('./routes/auth/auth.routes'))
app.use('/api/class', require('./routes/classes/add-class/class.routes'))
app.use('/api/syllabus', require('./routes/classes/syllabus/syllabus.routes'))
app.use('/api/task', require('./routes/daily-tasks/tasks.routes'))
app.use('/api/chat', require('./routes/chat/chat.routes'))
app.use('/api/event', require('./routes/event/event.routes'))

// super admin
app.use('/api/superadmin' , require('./routes/schoolRoutes/school.routes'))

// robotics
app.use('/api/admin', require('./routes/adminRoutes/admin.routes'))
app.use('/api/cat', require('./routes/categoryRoutes/category.routes'))
app.use('/api/subcat', require('./routes/subCategoryRoutes/subcategory.routes'))
app.use('/api/device', require('./routes/device/device.routes'))


// ai-api
app.use('/api/aiadmin', require('./routes/airoutes/aiadminroutes/aiadmin.routes'))
app.use('/api/aicat', require('./routes/airoutes/aicategoryroutes/aicategory.routes'))
app.use('/api/aisubcat', require('./routes/airoutes/aisubcategoryroutes/aisubcategory.routes'))
app.use('/api/aidevice', require('./routes/airoutes/aideviceroutes/aidevice.routes'))


// =====================================================================================


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`))