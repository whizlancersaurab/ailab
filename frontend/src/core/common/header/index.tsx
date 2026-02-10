import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  setDataLayout,
  setDataTheme,
} from "../../data/redux/themeSettingSlice";

import {
  setExpandMenu,
  setMobileSidebar,
} from "../../data/redux/sidebarSlice";
import { useState } from "react";
import { all_routes } from "../../../router/all_routes";
import { toast } from "react-toastify";
import { logout} from "../../../service/api";
import type { AppDispatch, RootState } from "../../data/redux/store";
import {reset} from '../../data/redux/authSlice'


const Header = () => {
  const routes = all_routes;
  const dataTheme = useSelector((state: any) => state.themeSetting.dataTheme);
  const dataLayout = useSelector((state: any) => state.themeSetting.dataLayout);

  const mobileSidebar = useSelector(
    (state: any) => state.sidebarSlice.mobileSidebar
  );

  const toggleMobileSidebar = () => {
    dispatch(setMobileSidebar(!mobileSidebar));
  };

  const onMouseEnter = () => {
    dispatch(setExpandMenu(true));
  };
  const onMouseLeave = () => {
    dispatch(setExpandMenu(false));
  };
  const handleToggleMiniSidebar = () => {
    if (dataLayout === "mini_layout") {
      dispatch(setDataLayout("default_layout"));
      localStorage.setItem("dataLayout", "default_layout");
    } else {
      dispatch(setDataLayout("mini_layout"));
      localStorage.setItem("dataLayout", "mini_layout");
    }
  };

  const handleToggleClick = () => {
    if (dataTheme === "default_data_theme") {
      dispatch(setDataTheme("dark_data_theme"));
    } else {
      dispatch(setDataTheme("default_data_theme"));

    }
  };

  const location = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {
        });
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {
          });
        }
        setIsFullscreen(false);
      }
    }
  };

 
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
   const {user ,role ,profileImage} = useSelector((state: RootState) => state.authSlice)
 

  const handleLogout = async () => {
    const { data } = await logout()
    if (data.success) {
      toast.success(data.message)
      dispatch(reset())
      navigate(`${routes.login}`)
    }
  }

 
  return (
    <>
      {/* Header */}
      <div className="header">
        {/* Logo */}
        <div
          className="header-left active"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <Link to={routes.adminDashboard} className="logo logo-normal">
            <img style={{ width: '190px' }} src="assets/img/logo2.png" alt="" />
          </Link>

          <Link id="toggle_btn" to="#" onClick={handleToggleMiniSidebar}>
            <i className="ti ti-menu-deep" />
          </Link>
        </div>
        {/* /Logo */}
        <Link
          id="mobile_btn"
          className="mobile_btn"
          to="#sidebar"
          onClick={toggleMobileSidebar}
        >
          <span className="bar-icon">
            <span />
            <span />
            <span />
          </span>
        </Link>
        <div className="header-user">
          <div className="nav user-menu">
            {/* Search */}
            <div className="mx-auto d-flex align-items-center justify-content-center">
              <div><img width={50} src="assets/img/logo.jpg" alt="" /></div>
              <div style={{color:'black'}} className="fw-bold fs-3">ROBOTICS & AI LAB MANAGEMENT SYSTEM</div>
            </div>
            {/* /Search */}
            <div className="d-flex align-items-center  justify-content-end">
              <div className="pe-1">
                {!location.pathname.includes("layout-dark") && (
                  <Link
                    onClick={handleToggleClick}
                    to="#"
                    id="dark-mode-toggle"
                    className="dark-mode-toggle activate btn btn-outline-light bg-white btn-icon me-1"
                  >
                    <i
                      className={
                        dataTheme === "default_data_theme"
                          ? "ti ti-moon"
                          : "ti ti-brightness-up"
                      }
                    />
                  </Link>
                )}
              </div>
              <div className="pe-1">
                <Link
                  onClick={toggleFullscreen}
                  to="#"
                  className="btn btn-outline-light bg-white btn-icon me-1"
                  id="btnFullscreen"
                >
                  <i className="ti ti-maximize" />
                </Link>
              </div>
              <div className="dropdown ms-1">
                <Link
                  to="#"
                  className="dropdown-toggle d-flex align-items-center"
                  data-bs-toggle="dropdown"
                >
                  <span className="avatar avatar-md rounded">
                    <img
                      style={{ objectFit: 'cover' }}
                      src={`${profileImage??"assets/img/user.jpg"}`} 
                      alt="Img"
                      className="img-fluid"
                    />
                  </span>
                </Link>
                <div className="dropdown-menu">
                  <div className="d-block">
                    <div className="d-flex align-items-center p-2">
                      <span className="avatar avatar-md me-2 online avatar-rounded">
                        <img
                          style={{ objectFit: 'cover' }}
                          src={`${profileImage??"assets/img/user.jpg"}`} 
                          alt="img"
                        />
                      </span>
                      <div>
                        <h6 className="text-capitalize">{user}</h6>
                        <p className="text-primary mb-0">{role}</p>
                      </div>
                    </div>
                    <hr className="m-0" />
                    <hr className="m-0" />
                     <button
                      onClick={()=>navigate(routes.userProfile)}
                      className="dropdown-item  d-inline-flex align-items-center p-2"

                    >
                      <i className="ti ti-user me-2 " />
                      My Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger d-inline-flex align-items-center p-2"

                    >
                      <i className="ti ti-login me-2 " />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile Menu */}
        <div className="dropdown mobile-user-menu">
          <Link
            to="#"
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fa fa-ellipsis-v" />
          </Link>
          <div className="dropdown-menu dropdown-menu-end">
            <Link className="dropdown-item" to={routes.userProfile}>
              My Profile
            </Link>
           
            <Link to={'#'} className="dropdown-item text-danger" onClick={handleLogout}>
              Logout
            </Link>
          </div>
        </div>
        {/* /Mobile Menu */}
      </div>
      {/* /Header */}
    </>
  );
};

export default Header;
