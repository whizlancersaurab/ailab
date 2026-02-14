import { Navigate, Route } from "react-router";
import { all_routes } from "./all_routes.tsx";
import Login from "../auth/login/login";
import Register from "../auth/register/register.tsx";
import ResetPassword from "../auth/resetPassword/resetPassword";
import ForgotPassword from "../auth/forgotPassword/forgotPassword";
import ResetPasswordSuccess from "../auth/resetPasswordSuccess/resetPasswordSuccess";
import Error404 from "../admin/pages/error/error-404";
import Error500 from "../admin/pages/error/error-500";
import BlankPage from "../admin/pages/blankPage";
import ComingSoon from "../admin/pages/comingSoon";
import UnderMaintenance from "../admin/pages/underMaintenance";
import UserProfile from '../admin/pages/profile/index.tsx'


// robotics
import AdminDashboard from "../admin/mainMenu/adminDashboard";
import Category from "../admin/management/add-category/index.tsx";
import SubCategory from "../admin/management/add-subcategory/index.tsx";
import Device from "../admin/management/devices/device-list/index.tsx";
import DeviceTypeList from "../admin/management/devices/device-type/index.tsx";
import OutOfStockDevice from "../admin/management/devices/outOfStock/index.tsx";


// ai
import AiDashBoard from '../admin/mainMenu/aiadminDashboard'
import AiCategory from '../admin/management/ai-category'
import AiSubCategory from '../admin/management/ai-subcategory'
import AiDevice from '../admin/management/ai-devices/device-list'
import AiDeviceTypeList from '../admin/management/ai-devices/device-type'
import AiOutOfStockDevice from '../admin/management/ai-devices/outOfStock'

// common components
import Calendar from "../admin/mainMenu/apps/calendar.tsx";
import DailyTask from "../admin/management/daily-task/index.tsx";
import Classes from "../admin/management/classes/add-class/index.tsx";
import AddSyllabus from "../admin/management/classes/add-syllabus/index.tsx";

// all schools
import School from "../admin/superadmin/schoolData/school.tsx";
import ActiveSchool from "../admin/superadmin/activeSchool/index.tsx";
import SuspendedSchool from "../admin/superadmin/suspendedSchool/index.tsx";
import SuperAdminDashboard from "../admin/mainMenu/superAdmin/index.tsx";
import NewSchool from "../admin/superadmin/registerExistence/index.tsx";

const routes = all_routes;

export const publicRoutes = [
  {
    path: "/",
    name: "Root",
    element: <Navigate to="/login" />,
    route: Route,
  },
  {
    path: routes.adminDashboard,
    element: <AdminDashboard />,
    route: Route,
  },

  {
    path: routes.blankPage,
    element: <BlankPage />,
    route: Route,
  },
  {
    path: routes.layoutDefault,
    element: <AdminDashboard />,
    route: Route,
  },
  {
    path: routes.layoutMini,
    element: <AdminDashboard />,
    route: Route,
  },
  {
    path: routes.layoutRtl,
    element: <AdminDashboard />,
    route: Route,
  },
  {
    path: routes.layoutBox,
    element: <AdminDashboard />,
    route: Route,
  },
  {
    path: routes.layoutDark,
    element: <AdminDashboard />,
    route: Route,
  },
   {
    path: routes.userProfile,
    element: < UserProfile />,
    route: Route,
  },

  // category
  {
    path: routes.robotcategory,
    element: <Category />,
    route: Route,
  },
  {
    path: routes.robotsubcategory,
    element: <SubCategory />,
    route: Route,
  },
  {
    path: routes.classlist,
    element: <Classes />,
    route: Route,
  },
  {
    path: routes.syllabus,
    element: <AddSyllabus />,
    route: Route,
  },
  {
    path: routes.devicelist,
    element: <Device />,
    route: Route,
  },
  {
    path: routes.dailytask,
    element: <DailyTask />,
    route: Route,
  },
  {
    path: routes.devicetypelist,
    element: <DeviceTypeList />,
    route: Route,
  },
  {
    path: routes.outofstock,
    element: <OutOfStockDevice />,
    route: Route,
  },
  {
    path: routes.events,
    element: <Calendar />,
    route: Route,
  },

  // ai-dashboard
  {
    path: routes.aidashboard,
    element: <AiDashBoard />,
    route: Route
  },
  {
    path: routes.aicategory,
    element: <AiCategory />,
    route: Route
  },
  {
    path: routes.aisubcategory,
    element: <AiSubCategory />,
    route: Route
  },
  {
    path: routes.aidevicelist,
    element: <AiDevice />,
    route: Route
  },
  {
    path: routes.aidevicetypelist,
    element: <AiDeviceTypeList />,
    route: Route
  },
  {
    path: routes.aioutofstock,
    element: <AiOutOfStockDevice />,
    route: Route
  },

  // super admin
  {
    path: routes.superadmindashboard,
    element: <SuperAdminDashboard />,
    route: Route
  },
  {
    path: routes.schools,
    element: <School />,
    route: Route
  },
  {
    path: routes.activeschools,
    element: <ActiveSchool />,
    route: Route
  },
  {
    path: routes.suspendedschools,
    element: <SuspendedSchool />,
    route: Route
  },
  {
     path: routes.addednewschool,
     element: <NewSchool />,
    route: Route
  }

];

export const authRoutes = [
  {
    path: routes.comingSoon,
    element: <ComingSoon />,
    route: Route,
  },
  {
    path: routes.login,
    element: <Login />,
    route: Route,
  },
  {
    path: routes.register,
    element: <Register />,
    route: Route,
  },

  {
    path: routes.resetPassword,
    element: <ResetPassword />,
    route: Route,
  },

  {
    path: routes.forgotPassword,
    element: <ForgotPassword />,
    route: Route,
  },

  {
    path: routes.error404,
    element: <Error404 />,
    route: Route,
  },
  {
    path: routes.error500,
    element: <Error500 />,
    route: Route,
  },
  {
    path: routes.underMaintenance,
    element: <UnderMaintenance />,
    route: Route,
  },

  {
    path: routes.resetPasswordSuccess,
    element: <ResetPasswordSuccess />,
  },

];
