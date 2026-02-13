import { useEffect, useState } from "react";

import { Link } from "react-router-dom";
import CountUp from "react-countup";
import { Calendar } from "primereact/calendar";
import type { Nullable } from "primereact/ts-helpers";
import "bootstrap-daterangepicker/daterangepicker.css";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../../router/all_routes";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DeviceModal from "../../management/devices/device-list/DeviceModl";
import {schoolStats} from "../../../service/api";
import type { RootState } from "../../../core/data/redux/store";
import { useSelector } from "react-redux";

const SuperAdminDashboard = () => {

  const routes = all_routes;
  const [date, setDate] = useState<Nullable<Date>>(null);

//   const settings = {
//     dots: false,
//     autoplay: false,
//     arrows: false,
//     slidesToShow: 2,
//     margin: 24,
//     speed: 500,
//     responsive: [
//       {
//         breakpoint: 1500,
//         settings: {
//           slidesToShow: 2,
//         },
//       },
//       {
//         breakpoint: 1400,
//         settings: {
//           slidesToShow: 2,
//         },
//       },
//       {
//         breakpoint: 992,
//         settings: {
//           slidesToShow: 2,
//         },
//       },
//       {
//         breakpoint: 800,
//         settings: {
//           slidesToShow: 2,
//         },
//       },
//       {
//         breakpoint: 776,
//         settings: {
//           slidesToShow: 2,
//         },
//       },
//       {
//         breakpoint: 567,
//         settings: {
//           slidesToShow: 1,
//         },
//       },
//     ],
//   };
  

  const [schoolData ,setSchoolData] = useState<any>({});
  const {user} = useSelector((state: RootState) => state.authSlice)


  // Fetch API
  const fetchAllDeviceStats = async () => {
    try {
          const {data} = await schoolStats()
          if(data.success){
               setSchoolData(data.data)
          }

    } catch (error: any) {
      console.error(error);

    }
  };

  useEffect(() => {
    fetchAllDeviceStats();
  }, []);


  return (
    <>

      <div className="page-wrapper">
        <div className="content">
          <>

            <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
              <div className="my-auto mb-2">
                <h3 className="page-title mb-1">DashBoard</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.adminDashboard}>Dashboard</Link>
                    </li>

                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                <div className="mb-2">
                  <Link
                  to={`/${routes.register}`}
                    className="btn btn-primary d-flex align-items-center"
                    // data-bs-toggle="modal"
                    // data-bs-target="#addDeviceModal"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    New Register
                  </Link>
                   <Link
                    to={routes.addednewschool}
                    className="btn btn-primary d-flex align-items-center"
                    // data-bs-toggle="modal"
                    // data-bs-target="#addDeviceModal"
                  >
                    <i className="ti ti-square-rounded-plus me-2" />
                    New Existence
                  </Link>
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-md-12">

                {/* Dashboard Content */}
                <div className="card bg-dark">
                  <div className="overlay-img">
                    <ImageWithBasePath
                      src="assets/img/bg/shape-04.png"
                      alt="img"
                      className="img-fluid shape-01"
                    />
                    <ImageWithBasePath
                      src="assets/img/bg/shape-01.png"
                      alt="img"
                      className="img-fluid shape-02"
                    />
                    <ImageWithBasePath
                      src="assets/img/bg/shape-02.png"
                      alt="img"
                      className="img-fluid shape-03"
                    />
                    <ImageWithBasePath
                      src="assets/img/bg/shape-03.png"
                      alt="img"
                      className="img-fluid shape-04"
                    />
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-xl-center justify-content-xl-between flex-xl-row flex-column">
                      <div className="mb-3 mb-xl-0">
                        <div className="d-flex align-items-center flex-wrap mb-2">
                          <h1 className="text-white me-2">
                            Welcome Back, Mr. {user}
                          </h1>

                        </div>
                        <p className="text-white">Have a Good day at work</p>
                      </div>

                    </div>
                  </div>
                </div>
                {/* /Dashboard Content */}
              </div>
            </div>
            <div className="row">
              {/* Total Devices */}
              <div className="col-xxl-4 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <Link to={routes.schools}>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-xl bg-danger-transparent me-2 p-1">
                          <ImageWithBasePath
                            src="assets/img/school.webp"
                            alt="img"
                          />
                        </div>
                        <div className="overflow-hidden flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h2 className="counter">
                              <CountUp end={schoolData.totalSchools??0} />
                            </h2>

                          </div>
                          <p className="fw-semibold">Total Schools</p>
                        </div>
                      </div>
                    </Link>
                    {/* <div className="d-flex align-items-center justify-content-between border-top mt-3 pt-3">
                        <p className="mb-0">
                          Active :{" "}
                          <span className="text-dark fw-semibold">3643</span>
                        </p>
                        <span className="text-light">|</span>
                        <p>
                          Inactive :{" "}
                          <span className="text-dark fw-semibold">11</span>
                        </p>
                      </div> */}
                  </div>
                </div>
              </div>
              {/* /Total Devices */}
              {/* Out of stocks */}
              <div className="col-xxl-4 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                     <Link to={routes.activeschools}>
                    <div className="d-flex align-items-center">
                      <div className="avatar avatar-xl me-2 bg-secondary-transparent p-1">
                        <ImageWithBasePath
                          src="assets/img/active.jpg"
                          alt="img"
                        />
                      </div>
                      <div className="overflow-hidden flex-fill">
                        <div className="d-flex align-items-center justify-content-between">
                          <h2 className="counter">
                            <CountUp end={schoolData.activeSchools??0}  />
                          </h2>

                        </div>
                        <p className="fw-semibold">Active Schools</p>
                      </div>
                    </div>
                    </Link>
                    {/* <div className="d-flex align-items-center justify-content-between border-top mt-3 pt-3">
                        <p className="mb-0">
                          Active :{" "}
                          <span className="text-dark fw-semibold">254</span>
                        </p>
                        <span className="text-light">|</span>
                        <p>
                          Inactive :{" "}
                          <span className="text-dark fw-semibold">30</span>
                        </p>
                      </div> */}
                  </div>
                </div>
              </div>
              {/* out of stocks */}
              {/* Total items */}
              <div className="col-xxl-4 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <Link to={routes.suspendedschools}>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-xl me-2 bg-warning-transparent p-1">
                          <ImageWithBasePath
                            src="assets/img/suspended.png"
                            alt="img"
                          />
                        </div>
                        <div className="overflow-hidden flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h2 className="counter">
                              <CountUp end={schoolData.suspendedSchools??0}  />
                            </h2>

                          </div>
                          <p className="fw-semibold">Suspended Schools</p>
                        </div>
                      </div>
                    </Link>

                    {/* <div className="d-flex align-items-center justify-content-between border-top mt-3 pt-3">
                        <p className="mb-0">
                          Active :{" "}
                          <span className="text-dark fw-semibold">161</span>
                        </p>
                        <span className="text-light">|</span>
                        <p>
                          Inactive :{" "}
                          <span className="text-dark fw-semibold">02</span>
                        </p>
                      </div> */}
                  </div>
                </div>
              </div>
              {/* /Total items */}

            </div>
            <div className="row">

              <div className="col-12 d-flex">
                <div className="card flex-fill">
                  <div className="card-header d-flex align-items-center justify-content-between">
                    <div>
                      <h4 className="card-title">Today</h4>
                    </div>

                  </div>
                  <div className="card-body ">
                    {/* <div className="datepic mb-4" /> */}
                    <Calendar
                      className="datepickers mb-4"
                      value={date}
                      onChange={(e) => setDate(e.value)}
                      inline
                    />

                  </div>
                </div>
              </div>

            

            </div>
          </>
        </div>
        
        <DeviceModal />
      </div>


    </>
  );
};

export default SuperAdminDashboard;
