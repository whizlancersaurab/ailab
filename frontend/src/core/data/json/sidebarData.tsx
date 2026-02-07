import { all_routes } from "../../../router/all_routes";
const routes = all_routes;

export const SidebarData = [
  {
    label: "MAIN",
    submenuOpen: false,
    showSubRoute: false,
    submenuHdr: "Main",
    submenuItems: [
      {
        label: "Robotics Lab",
        icon: "ti ti-layout-dashboard",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "Robotics Dashboard", link: routes.adminDashboard },
          { label: "Category", link: routes.robotcategory },
          { label: "Sub-Catgory", link: routes.robotsubcategory },
          { label: "Devices", link: routes.devicelist },
          { label: "Out Of Stock", link: routes.outofstock },
          { label: "Device-Type", link: routes.devicetypelist },

        ],

      },

      {
        label: "AI Lab",
        link: routes.aidashboard,
        icon: "ti ti-layout-dashboard",
        submenu: true,
        showSubRoute: false,
        submenuItems: [
          { label: "AI Dashboard", link: routes.aidashboard },
          { label: "Category", link: routes.aicategory },
          { label: "Sub-Catgory", link: routes.aisubcategory },
          { label: "Devices", link: routes.aidevicelist },
          { label: "Out Of Stock", link: routes.aioutofstock },
          { label: "Device-Type", link: routes.aidevicetypelist },
        ],

      },
      {
        label: "Classes",
        link: routes.classlist,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,


      },
      {
        label: "Class Syllabus",
        link: routes.syllabus,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,


      },
      {
        label: "Daily Tasks",
        link: routes.dailytask,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,


      },
      {
        label: "Events",
        link: routes.events,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,

      },

    ],
  },

  {
    label: "LAYOUT",
    submenuOpen: false,
    showSubRoute: false,
    submenuHdr: "LAYOUT",
    submenuItems: [
      {
        label: "Default",
        icon: "ti ti-layout-sidebar",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutDefault,
        themeSetting: true,
      },
      {
        label: "Mini",
        icon: "ti ti-layout-align-left",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutMini,
        themeSetting: true,
      },
      {
        label: "RTL",
        icon: "ti ti-text-direction-rtl",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutRtl,
        themeSetting: true,
      },
      {
        label: "Box",
        icon: "ti ti-layout-distribute-vertical",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutBox,
        themeSetting: true,
      },

    ],
  },
];
export const superAdminSidebar = [
  {
    label: "MAIN",
    submenuOpen: false,
    showSubRoute: false,
    submenuHdr: "Main",
    submenuItems: [
      {
        label: "Dashboard",
        link: routes.superadmindashboard,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,

      },

      {
        label: "All Schools",
        link: routes.schools,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,

      },
      {
        label: "Active Schools",
        link: routes.activeschools,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,

      },
      {
        label: "Suspended Schools",
        link: routes.suspendedschools,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,

      },
      {
        label: "Class Syllabus",
        link: routes.syllabus,
        icon: "ti ti-layout-dashboard",
        submenu: false,
        showSubRoute: false,


      },

    ],
  },

  {
    label: "LAYOUT",
    submenuOpen: false,
    showSubRoute: false,
    submenuHdr: "LAYOUT",
    submenuItems: [
      {
        label: "Default",
        icon: "ti ti-layout-sidebar",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutDefault,
        themeSetting: true,
      },
      {
        label: "Mini",
        icon: "ti ti-layout-align-left",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutMini,
        themeSetting: true,
      },
      {
        label: "RTL",
        icon: "ti ti-text-direction-rtl",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutRtl,
        themeSetting: true,
      },
      {
        label: "Box",
        icon: "ti ti-layout-distribute-vertical",
        submenu: false,
        showSubRoute: false,
        link: routes.layoutBox,
        themeSetting: true,
      },

    ],
  },
];







