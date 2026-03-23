import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { SidebarData, superAdminSidebar, TeacherSidebarData } from "../../data/json/sidebarData";
import "../../../style/icon/tabler-icons/webfont/tabler-icons.css";
import { setExpandMenu } from "../../data/redux/sidebarSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  resetAllMode,
  setDataLayout,
} from "../../data/redux/themeSettingSlice";
import usePreviousRoute from "./usePreviousRoute";

import "../../../../node_modules/react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";
import "../../../../node_modules/react-perfect-scrollbar/dist/css/styles.css";
import type { RootState } from "../../data/redux/store";

import { switchSchool, usersSchools } from "../../../service/api";
import { toast } from "react-toastify";
import Select from "react-select";


const Sidebar = () => {

  const [customSide, setCustomSide] = useState<any[]>([]);
  const { role } = useSelector((state: RootState) => state.authSlice)


  useEffect(() => {
    if (role) {
      if (role == "SUPER_ADMIN") {
        setCustomSide([...superAdminSidebar])
      } else if (role == "ADMIN") {
        setCustomSide([...SidebarData]);
      }
      else {
        setCustomSide([...TeacherSidebarData]);
      }
    }
  }, []);



  const Location = useLocation();

  const [subOpen, setSubopen] = useState<any>("");
  const [subsidebar, setSubsidebar] = useState("");

  const toggleSidebar = (title: any) => {
    localStorage.setItem("menuOpened", title);
    if (title === subOpen) {
      setSubopen("");
    } else {
      setSubopen(title);
    }
  };

  const toggleSubsidebar = (subitem: any) => {
    if (subitem === subsidebar) {
      setSubsidebar("");
    } else {
      setSubsidebar(subitem);
    }
  };

  const handleLayoutChange = (layout: string) => {
    dispatch(setDataLayout(layout));
  };

  const handleClick = (label: any, themeSetting: any, layout: any) => {
    toggleSidebar(label);
    if (themeSetting) {
      handleLayoutChange(layout);
    }
  };

  const getLayoutClass = (label: any) => {
    switch (label) {
      case "Default":
        return "default_layout";
      case "Mini":
        return "mini_layout";
      case "Box":
        return "boxed_layout";
      case "Dark":
        return "dark_data_theme";
      case "RTL":
        return "rtl";
      default:
        return "";
    }
  };
  const location = useLocation();
  const dispatch = useDispatch();
  const previousLocation = usePreviousRoute();

  useEffect(() => {
    const layoutPages = [
      "/layout-dark",
      "/layout-rtl",
      "/layout-mini",
      "/layout-box",
      "/layout-default",
    ];



    const isCurrentLayoutPage = layoutPages.some((path) =>
      location.pathname.includes(path)
    );
    const isPreviousLayoutPage =
      previousLocation &&
      layoutPages.some((path) => previousLocation.pathname.includes(path));

    if (isPreviousLayoutPage && !isCurrentLayoutPage) {
      dispatch(resetAllMode());
    }
  }, [location, previousLocation, dispatch]);

  useEffect(() => {
    setSubopen(localStorage.getItem("menuOpened"));
    // Select all 'submenu' elements
    const submenus = document.querySelectorAll(".submenu");

    const mainWrapper = document.querySelector('.main-wrapper');
    if (mainWrapper) {
      mainWrapper.classList.remove('slide-nav');
    }
    // Loop through each 'submenu'
    submenus.forEach((submenu) => {
      // Find all 'li' elements within the 'submenu'
      const listItems = submenu.querySelectorAll("li");
      submenu.classList.remove("active");
      // Check if any 'li' has the 'active' class
      listItems.forEach((item) => {
        if (item.classList.contains("active")) {
          // Add 'active' class to the 'submenu'
          submenu.classList.add("active");
          return;
        }
      });
    });
  }, [Location.pathname]);

  const onMouseEnter = () => {
    dispatch(setExpandMenu(true));
  };
  const onMouseLeave = () => {
    dispatch(setExpandMenu(false));
  };


  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);
  const [schoolId, setSchoolId] = useState(localStorage.getItem('schoolId'));


  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data } = await usersSchools();

        if (data?.success && data.data?.length > 0) {
          setSchools(data.data);

          // ✅ ADD THIS HERE
          const savedId = localStorage.getItem("schoolId");

          const defaultSchool =
            data.data.find((s: any) => s.id == savedId) || data.data[0];

          setSelectedSchool(defaultSchool);
          setSchoolId(defaultSchool.id);
        }
      } catch (error) {
        console.error("Failed to fetch schools:", error);
      }
    };

    fetchSchools();
  }, []);
  const schoolOptions = schools.map((school) => ({
    value: school.id,
    label: school.name,
    logo: school.schoolLogo,
  }));


  const handleCustomSchoolSwitch = async (school: any) => {
    localStorage.setItem("schoolId", school.id);
    setSchoolId(school.id);

    try {
      const { data } = await switchSchool({ schoolId: school.id });

      if (data.success) {
        setSelectedSchool(school);
        toast.success(data.message);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to switch school");
    }
  };

  return (
    <>
      <div
        className="sidebar"
        id="sidebar"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <PerfectScrollbar>
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
             
              {selectedSchool && (
                <ul>
                  <li>
                    <Select
                      className="mb-4"
                      options={schoolOptions}
                      value={schoolOptions.find(
                        (opt) => opt.value === (schoolId || selectedSchool?.id)
                      )}
                      onChange={(selected: any) =>
                        handleCustomSchoolSwitch({
                          id: selected.value,
                          name: selected.label,
                          schoolLogo: selected.logo,
                        })
                      }
                      formatOptionLabel={(option: any) => (
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <img
                            src={option.logo}
                            alt=""
                            width={25}
                            height={25}
                            style={{ marginRight: 8, borderRadius: "50%" }}
                          />
                          {option.label}
                        </div>
                      )}
                    />
                  </li>
                </ul>
              )}
              <ul>
                {customSide && customSide?.map((mainLabel: any, index: any) => (
                  <li key={index}>
                    <h6 className="submenu-hdr">
                      <span>{mainLabel?.label}</span>
                    </h6>
                    <ul>
                      {mainLabel?.submenuItems?.map((title: any) => {
                        // Flatten all nested links for active state matching
                        const flatLinks: string[] = [
                          title?.link,
                          title?.subLink1,
                          title?.subLink2,
                          title?.subLink3,
                          title?.subLink4,
                          title?.subLink5,
                          title?.subLink6,
                          title?.subLink7,
                          ...(title?.submenuItems?.flatMap((link: any) => {
                            return [
                              link?.link,
                              ...(link?.submenuItems?.map(
                                (item: any) => item?.link
                              ) || []),
                            ];
                          }) || []),
                        ].filter(Boolean);

                        const isActive = flatLinks.includes(Location.pathname);

                        return (
                          <li className="submenu" key={title.label}>
                            <Link
                              to={title?.submenu ? "#" : title?.link}
                              onClick={() =>
                                handleClick(
                                  title?.label,
                                  title?.themeSetting,
                                  getLayoutClass(title?.label)
                                )
                              }
                              className={`${subOpen === title?.label ? "subdrop" : ""
                                } ${isActive ? "active" : ""}`}
                            >
                              <i className={title.icon}></i>
                              <span>{title?.label}</span>
                              {title?.version && (
                                <span className="badge badge-primary badge-xs text-white fs-10 ms-auto">
                                  {title?.version}
                                </span>
                              )}
                              <span
                                className={title?.submenu ? "menu-arrow" : ""}
                              />
                            </Link>

                            {/* Submenu Level 1 */}
                            {title?.submenu !== false &&
                              subOpen === title?.label && (
                                <ul style={{ display: "block" }}>
                                  {title?.submenuItems?.map((item: any) => {
                                    const subLinks: string[] = [
                                      item?.link,
                                      item?.subLink1,
                                      item?.subLink2,
                                      item?.subLink3,
                                      item?.subLink4,
                                      item?.subLink5,
                                      item?.subLink6,
                                      ...(item?.submenuItems?.map(
                                        (sub: any) => sub?.link
                                      ) || []),
                                    ].filter(Boolean);

                                    const isSubActive = subLinks.includes(
                                      Location.pathname
                                    );

                                    return (
                                      <li
                                        key={item.label}
                                        className={
                                          item?.submenuItems
                                            ? "submenu submenu-two"
                                            : ""
                                        }
                                      >
                                        <Link
                                          to={item?.link}
                                          className={`${isSubActive ? "active" : ""
                                            } ${subsidebar === item?.label
                                              ? "subdrop"
                                              : ""
                                            }`}
                                          onClick={() =>
                                            toggleSubsidebar(item?.label)
                                          }
                                        >
                                          {item?.label}
                                          <span
                                            className={
                                              item?.submenu ? "menu-arrow" : ""
                                            }
                                          />
                                        </Link>

                                        {/* Submenu Level 2 */}
                                        {item?.submenuItems &&
                                          subsidebar === item?.label && (
                                            <ul style={{ display: "block" }}>
                                              {item?.submenuItems?.map(
                                                (subItem: any) => {
                                                  const isDeepActive =
                                                    subItem?.link ===
                                                    Location.pathname;

                                                  return (
                                                    <li key={subItem.label}>
                                                      <Link
                                                        to={subItem?.link}
                                                        className={`submenu-two ${isDeepActive
                                                          ? "active"
                                                          : ""
                                                          }`}
                                                      >
                                                        {subItem?.label}
                                                      </Link>
                                                    </li>
                                                  );
                                                }
                                              )}
                                            </ul>
                                          )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              )}
                          </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </PerfectScrollbar>
      </div>
    </>
  );
};

export default Sidebar;
