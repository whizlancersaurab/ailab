import axios from 'axios'


const baseUrl: string = import.meta.env.VITE_API_URL 

export const api = axios.create({
    baseURL: baseUrl,
    withCredentials: true
})



export const setupAxiosInterceptor = (navigate: Function) => {
  
  let isRefreshing = false;
  let failedQueue: any[] = [];

  const processQueue = (error: any) => {
    failedQueue.forEach(p => (error ? p.reject(error) : p.resolve()));
    failedQueue = [];
  };

  api.interceptors.response.use(
    response => response,
    async error => {
      const originalRequest = error.config;
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => api(originalRequest));
        }
        console.log("hello")
        originalRequest._retry = true;
        isRefreshing = true;
        try { 
          await api.get("/auth/refresh"); 
          isRefreshing = false;
          processQueue(null);
          return api(originalRequest) ;
        } catch (err) {
          console.log("Refresh failed", err);
          isRefreshing = false;
          processQueue(err);
          navigate("/login");
          return Promise.reject(err);
        }
      }

      return Promise.reject(error);
    }
  );
};

// auth =====================================================================
export const register = (data: object) => api.post('/auth/register', data)
export const updateProfile = (data: object) => api.post('/auth/update', data)
export const login = (data: object) => api.post('/auth/login', data)
export const forgotPassword = (email: object) => api.post('/auth/forgot-password', email)
export const resetPassword = (data: object) => api.post('/auth/reset-password', data)
export const logout = () => api.get('/auth/logout')
export const userInfo = () => api.get('/auth/user')
export const speUser = () => api.get('/auth/speUser')
export const usersSchools = ()=>api.get('/auth/usersschools')
export const switchSchool = (data:object)=>api.post('/auth/switch-school' , data)
export const allUsers = ()=>api.get('/auth/allusers')

// teachers api
export const speSchoolTeachers = ()=>api.get('/teacher/speschoolteachers')
export const deleteTeacher = (id:number)=>api.delete(`/teacher/delteacher/${id}`)
export const addNewTeacher = (data:object)=>api.post('/teacher/addteacher' , data)

// superadin
export const allSchools = ()=>api.get('/superadmin/allschools')
export const allActiveSchools = ()=>api.get('/superadmin/allactiveschools')
export const allSuspendedSchools = ()=>api.get('/superadmin/allsuspendedschools')
export const speSchool = (id:number)=>api.get(`/superadmin/speschool/${id}`)
export const changeSchoolStatus = (id:number , data:object)=>api.patch(`/superadmin/updschool/${id}` , data)
export const updateSchool = (id:number , data:object)=>api.patch(`/superadmin/updateschool/${id}` , data)
export const delSchool = (id:number)=>api.delete(`/superadmin/delschool/${id}`)
export const schoolStats = ()=>api.get('/superadmin/schoolstats')
export const addNewSchool = (data:object)=>api.post('/superadmin/addnew' ,data)

//classes ==================================================================
export const addClass = (data: object) => api.post('/class/addclass', data)
export const allClasses = () => api.get('/class/allclasses')
export const deleteClass = (id: any) => api.delete(`/class/delclass/${id}`)
export const speClass = (id: number) => api.get(`/class/speclass/${id}`)
export const editClass = (data: object, id: number) => api.patch(`/class/editclass/${id}`, data)
export const classForOption = () => api.get('/class/option')


// add class syllabus ========================================================
export const addSyllabus = (data: object) => api.post('/syllabus/addsyllabus', data)
export const allClassSyllabus = () => api.get('/syllabus/allsyllabus')
export const deleteSpeSyllabus = (id: number) => api.delete(`/syllabus/delsyllabus/${id}`)
export const speSyllabus = (id: number) => api.get(`/syllabus/spesyllabus/${id}`)
export const updateSyllabus = (data: object, id: number) => api.patch(`/syllabus/editsyllabus/${id}`, data)
export const allMonthsForOptionByClassId = (class_id: number) => api.get(`/syllabus/monthopt/${class_id}`)
export const getSyllabusByClassIdAndId = (class_id: number, id: number) => api.get(`/syllabus/getsyllabus/${class_id}/${id}`)


// tasks=======================================================================
export const addTask = (data: object) => api.post('/task/add', data)
export const deleteTask = (id: number) => api.delete(`/task/delete/${id}`)
export const allTasks = () => api.get('/task/all')
export const speTask = (id: number) => api.get(`/task/spetask/${id}`)
export const updateTask = (data: object, id: number) => api.patch(`/task/edit/${id}`, data)
export const classProgressData = (class_id: number) => api.get(`/task/progress/${class_id}`)
export const allClassesProgressData = () => api.get('/task/allclassesprodata')

// event =======================================================================
export const addEvent = (data: object) => api.post('/event/addevent', data)
export const allEvents = () => api.get('/event/events')
export const updateEvent = (data: object, id: number) => api.put(`/event/edit/${id}`, data)
export const deleteEvent = (id: number) => api.delete(`/event/del/${id}`)


// chatboat=======================================================================
export const chatBoat = (data: object) => api.post('/chat/send', data)

//robotics admin =====================================================================
export const deviceCount = () => api.get('/admin/devicescount')
export const deviceTypeCount = () => api.get('/admin/totaldevicetypecount')
export const getOutOfStockCount = () => api.get('/admin/outofstockcount')

//robotics category ==================================================================
export const addCategory = (data: object) => api.post('/cat/addcat', data)
export const allCategories = () => api.get('/cat/allcat')
export const deleteCategory = (id: Number) => api.delete(`/cat/delcat/${id}`)
export const speCategory = (id: number) => api.get(`/cat/specat/${id}`)
export const updateCategory = (data: object, id: number) => api.patch(`/cat/edit/${id}`, data)
export const categoryForOption = () => api.get('/cat/catoption')

//robotics sub-category ==============================================================
export const addSubCategory = (data: object) => api.post('/subcat/addsubcat', data)
export const deleteSubCategory = (id: number) => api.delete(`/subcat/delsubcat/${id}`)
export const allSubCategories = () => api.get('/subcat/allsubcat')
export const getSpeSubCategory = (id: number) => api.get(`/subcat/spesubcat/${id}`)
export const updateSubCategory = (data: object, id: number) => api.patch(`/subcat/editsubcat/${id}`, data)
export const SubcategoryForOption = (id: number) => api.get(`/subcat/subcatbycat/${id}`)


//robotics device apis=================================================================
export const addDevice = (data: object) => api.post('/device/add', data)
export const allDevices = () => api.get('/device/all')
export const deleteDevice = (id: number) => api.delete(`/device/delete/${id}`)
export const speDevice = (id: number) => api.get(`/device/spe/${id}`)
export const updateDevice = (data: object, id: number) => api.patch(`/device/update/${id}`, data)
export const deviceTypeCountWithData = () => api.get('/device/devicecount')
export const OutOfStockDevices = () => api.get('/device/outofstock')
export const addQuantity = (data: object, id: number) => api.patch(`/device/addquantity/${id}`, data)



// ai apis ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

//ai admin =====================================================================
export const AideviceCount = () => api.get('/aiadmin/devicescount')
export const AideviceTypeCount = () => api.get('/aiadmin/totaldevicetypecount')
export const AigetOutOfStockCount = () => api.get('/aiadmin/outofstockcount')

// aicategory
export const addAiCategory = (data: object) => api.post('/aicat/addcat', data)
export const allAiCategories = () => api.get('/aicat/allcat')
export const deleteAiCategory = (id: Number) => api.delete(`/aicat/delcat/${id}`)
export const speAiCategory = (id: number) => api.get(`/aicat/specat/${id}`)
export const updateAiCategory = (data: object, id: number) => api.patch(`/aicat/edit/${id}`, data)
export const aiCategoryForOption = () => api.get('/aicat/catoption')

// aisubcategory
export const addAiSubCategory = (data: object) => api.post('/aisubcat/addsubcat', data)
export const deleteAiSubCategory = (id: number) => api.delete(`/aisubcat/delsubcat/${id}`)
export const allAiSubCategories = () => api.get('/aisubcat/allsubcat')
export const getAiSpeSubCategory = (id: number) => api.get(`/aisubcat/spesubcat/${id}`)
export const updateAiSubCategory = (data: object, id: number) => api.patch(`/aisubcat/editsubcat/${id}`, data)
export const AiSubcategoryForOption = (id: number) => api.get(`/aisubcat/subcatbycat/${id}`)

// aidevices
export const addAiDevice = (data: object) => api.post('/aidevice/add', data)
export const allAiDevices = () => api.get('/aidevice/all')
export const deleteAiDevice = (id: number) => api.delete(`/aidevice/delete/${id}`)
export const speAiDevice = (id: number) => api.get(`/aidevice/spe/${id}`)
export const updateAiDevice = (data: object, id: number) => api.patch(`/aidevice/update/${id}`, data)
export const AideviceTypeCountWithData = () => api.get('/aidevice/devicecount')
export const OutOfStockAiDevices = () => api.get('/aidevice/outofstock')
export const addQuantityAi = (data: object, id: number) => api.patch(`/aidevice/addquantity/${id}`, data)

