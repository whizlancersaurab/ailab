import { useEffect, useMemo, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Link, useParams } from "react-router-dom";
import CountUp from "react-countup";
import "bootstrap-daterangepicker/daterangepicker.css";
import ImageWithBasePath from "../../../core/common/imageWithBasePath";
import { all_routes } from "../../../router/all_routes";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { aiDeviceCountForSchoolDas, aiDeviceTypeCountForSchoolDas, AIgetOutOfStockCountForSchoolDas, classForOption, classProgressDataForSchoolDas, deviceCountForSchoolDas, deviceTypeCountForSchoolDas, getOutOfStockCountForSchoolDas } from "../../../service/api";
import type { OptionType } from "../../../core/data/interface";
import Select from 'react-select'
import type { RootState } from "../../../core/data/redux/store";
import { useSelector } from "react-redux";


interface ProgressData {
  totalTasks: number,
  completedTasks: number,
  completionPercent: number
}



const SchoolDashboard = () => {

  const routes = all_routes;
  const { schoolId } = useParams()



  const settings = {
    dots: false,
    autoplay: false,
    arrows: false,
    slidesToShow: 2,
    margin: 24,
    speed: 500,
    responsive: [
      {
        breakpoint: 1500,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 1400,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 776,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 567,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };


  const [deviceNo, setDeviceNo] = useState<number>(0);
  const [deviceTypeNo, setDeviceTypeNo] = useState<number>(0);
  const [outOfStocks, setOutOfStocks] = useState<number>(0)

  const [aiDeviceNo, setAiDeviceNo] = useState<number>(0);
  const [aiDeviceTypeNo, setAiDeviceTypeNo] = useState<number>(0);
  const [aiOutOfStocks, setAiOutOfStocks] = useState<number>(0)

  const [classOptions, setClassOptions] = useState<OptionType[]>([])
  const [className, setClassName] = useState<number | null>(null)

  const [addModal2, setAddModal2] = useState<boolean>(false)

  const [progressData, setProgressData] = useState<ProgressData>({
    totalTasks: 0,
    completedTasks: 0,
    completionPercent: 0
  });
  const { user } = useSelector((state: RootState) => state.authSlice)
  // Fetch API
  const fetchAllDeviceStats = async (schoolId: number) => {
    try {

      const [deviceCountRes, deviceTypeCountRes, outOfStocksDeviceRes, aideviceCountRes, aideviceTypeCountRes, aioutOfStocksDeviceRes] = await Promise.all([
        deviceCountForSchoolDas(schoolId),
        deviceTypeCountForSchoolDas(schoolId),
        getOutOfStockCountForSchoolDas(schoolId),
        aiDeviceCountForSchoolDas(schoolId),
        aiDeviceTypeCountForSchoolDas(schoolId),
        AIgetOutOfStockCountForSchoolDas(schoolId)
      ]);

      if (deviceCountRes.data.success) {
        setDeviceNo(deviceCountRes.data.devices);
      }
      if (deviceTypeCountRes.data.success) {
        setDeviceTypeNo(deviceTypeCountRes.data.data);
      }
      if (outOfStocksDeviceRes.data.success) {
        setOutOfStocks(outOfStocksDeviceRes.data.data)
      }

      if (aideviceCountRes.data.success) {
        setAiDeviceNo(aideviceCountRes.data.devices);
      }
      if (aideviceTypeCountRes.data.success) {
        setAiDeviceTypeNo(aideviceTypeCountRes.data.data);
      }
      if (aioutOfStocksDeviceRes.data.success) {
        setAiOutOfStocks(aioutOfStocksDeviceRes.data.data)
      }

    } catch (error: any) {
      console.error(error);

    }
  };

  const fetchClassForOption = async () => {
    try {

      const { data } = await classForOption()
      if (data.success) {
        setClassOptions(data.data.map((c: any) => ({ value: c.id, label: `Class ${c.class_name}` })))
      }
      setClassName(Number(data.data[0].id))

    } catch (error) {
      console.log(error)
    }
  }

  const fetchProgressData = async (id: number) => {
    if (!schoolId) return
    try {
      const { data } = await classProgressDataForSchoolDas(id, Number(schoolId));
      if (data.success) {
        setProgressData(data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const chartOptions = useMemo(() => ({
    chart: {
      height: 218,
      width: 218,
      type: "donut" as const,
      toolbar: { show: false }
    },
    legend: { show: false },
    colors: ["#3D5EE1", "#6FCCD8"],
    labels: ["Completed", "Remaining"],
    responsive: [
      {
        breakpoint: 480,
        options: { chart: { width: 180 } }
      }
    ]
  }), []);

  const chartSeries = useMemo(() => {
    const completed = progressData.completionPercent;
    const remaining = 100 - completed;
    return [completed, remaining];
  }, [progressData.completionPercent]);


  useEffect(() => {
    fetchClassForOption()
  }, []);

  useEffect(() => {

    if (schoolId) {
      fetchAllDeviceStats(Number(schoolId));
    }

  }, [setAddModal2, addModal2]);

  useEffect(() => {

    if (className) {
      fetchProgressData(className)
    }

  }, [className, setClassName])

  return (
    <>

      <div className="page-wrapper">
        <div className="content">
          <>
            <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
              <div className="my-auto mb-2">
                <h3 className="page-title mb-1">Lab Management</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={routes.superadmindashboard}>Dashboard</Link>

                    </li>

                  </ol>
                </nav>
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
              <h1 className="fw-semibold fs-4 my-2">Robotics Data</h1>
              {/* Total Devices */}
              <div className="col-xxl-4 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <Link to={`${routes.robodevices}/${schoolId}`}>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-xl bg-danger-transparent me-2 p-1">
                          <ImageWithBasePath
                            src="assets/img/device.png"
                            alt="img"
                          />
                        </div>
                        <div className="overflow-hidden flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h2 className="counter">
                              <CountUp end={deviceNo} />
                            </h2>

                          </div>
                          <p className="fw-semibold">No Of Devices</p>
                        </div>
                      </div>
                    </Link>

                  </div>
                </div>
              </div>
              {/* /Total Devices */}
              {/* Out of stocks */}
              <div className="col-xxl-4 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <Link to={`${routes.robotoutofstocks}/${schoolId}`}>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-xl me-2 bg-secondary-transparent p-1">
                          <ImageWithBasePath
                            src="assets/img/out.webp"
                            alt="img"
                          />
                        </div>
                        <div className="overflow-hidden flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h2 className="counter">
                              <CountUp end={outOfStocks} />
                            </h2>

                          </div>
                          <p className="fw-semibold">Out Of Stocks</p>
                        </div>
                      </div>
                    </Link>

                  </div>
                </div>
              </div>
              {/* out of stocks */}
              {/* Total items */}
              <div className="col-xxl-4 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <Link to={`${routes.robodevicestype}/${schoolId}`}>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-xl me-2 bg-warning-transparent p-1">
                          <ImageWithBasePath
                            src="assets/img/device1.jpg"
                            alt="img"
                          />
                        </div>
                        <div className="overflow-hidden flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h2 className="counter">
                              <CountUp end={deviceTypeNo} />
                            </h2>

                          </div>
                          <p className="fw-semibold">List Of Devices</p>
                        </div>
                      </div>
                    </Link>


                  </div>
                </div>
              </div>
              {/* /Total items */}
            </div>
            <div className="row">
              <h1 className="fw-semibold fs-4 my-2">AI Data</h1>
              {/* Total Devices */}
              <div className="col-xxl-4 col-sm-6 d-flex">
                <div className="card flex-fill animate-card border-0">
                  <div className="card-body">
                    <Link to={`${routes.aidevices}/${schoolId}`}>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-xl bg-danger-transparent me-2 p-1">
                          <ImageWithBasePath
                            src="assets/img/device.png"
                            alt="img"
                          />
                        </div>
                        <div className="overflow-hidden flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h2 className="counter">
                              <CountUp end={aiDeviceNo} />
                            </h2>

                          </div>
                          <p className="fw-semibold">No Of AI Devices</p>
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
                    <Link to={`${routes.aidevicesoutofstock}/${schoolId}`}>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-xl me-2 bg-secondary-transparent p-1">
                          <ImageWithBasePath
                            src="assets/img/out.webp"
                            alt="img"
                          />
                        </div>
                        <div className="overflow-hidden flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h2 className="counter">
                              <CountUp end={aiOutOfStocks} />
                            </h2>

                          </div>
                          <p className="fw-semibold">Out Of AI Stocks</p>
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
                    <Link to={`${routes.aidevicestype}/${schoolId}`}>
                      <div className="d-flex align-items-center">
                        <div className="avatar avatar-xl me-2 bg-warning-transparent p-1">
                          <ImageWithBasePath
                            src="assets/img/device1.jpg"
                            alt="img"
                          />
                        </div>
                        <div className="overflow-hidden flex-fill">
                          <div className="d-flex align-items-center justify-content-between">
                            <h2 className="counter">
                              <CountUp end={aiDeviceTypeNo} />
                            </h2>

                          </div>
                          <p className="fw-semibold">List Of AI Devices</p>
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



              <div className=" col-xl-6 col-md-12 d-flex flex-column">
                <div className="card">
                  <div className="card-header d-flex align-items-center justify-content-between">
                    <h4 className="card-title">Task Status</h4>
                    <div className="dropdown d-flex align-items-center">
                      <span className="me-2">Filter</span>

                      <Select<OptionType>
                        options={classOptions}
                        value={classOptions.find((o) => Number(o.value) === className)}
                        onChange={(option: any) => setClassName(option.value)}
                        placeholder="Select Class"
                        className="text-capitalize"
                      />
                    </div>
                  </div>
                  <div className="card-body">

                    <div className="tab-content">
                      <div
                        className="tab-pane fade active show"
                        id="students"
                      >
                        <div className="row gx-3">
                          <div className="col-sm-4">
                            <div className="card bg-light-300 shadow-none border-0">
                              <div className="card-body p-3 text-center">
                                <h5>{progressData.totalTasks}</h5>
                                <p className="fs-12">Total Tasks</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className="card bg-light-300 shadow-none border-0">
                              <div className="card-body p-3 text-center">
                                <h5>{progressData.completedTasks}</h5>
                                <p className="fs-12">Completed</p>
                              </div>
                            </div>
                          </div>
                          <div className="col-sm-4">
                            <div className="card bg-light-300 shadow-none border-0">
                              <div className="card-body p-3 text-center">
                                <h5>{progressData.completionPercent}</h5>
                                <p className="fs-12">Completion Percent</p>
                              </div>
                            </div>
                          </div>
                        </div>


                        <div className="text-center">
                          <ReactApexChart
                            options={chartOptions}
                            series={chartSeries}
                            type="donut"
                            height={218}
                            width={218}
                          />
                          <Link
                            to={`${routes.dailytaskdata}/${schoolId}`}
                            className="btn btn-light"
                          >
                            <i className="ti ti-calendar-share me-1" />
                            View All
                          </Link>
                        </div>


                      </div>

                    </div>
                  </div>
                </div>

              </div>

              <div className="col-xl-6 col-md-12 d-flex flex-column">
                {/* Quick Links */}
                <div className="card flex-fill">
                  <div className="card-header d-flex align-items-center justify-content-between">
                    <h4 className="card-title">Quick Links</h4>
                  </div>

                  <div className="card-body ">
                    <Slider
                      {...settings}
                      className="owl-carousel link-slider"
                    >

                      <div className="item">
                        <Link
                          to={`${routes.dailytaskdata}/${schoolId}`}
                          className="d-block bg-success-transparent ronded p-1 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-success rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-success rounded-circle">
                              <i className="ti ti-calendar" />
                            </span>
                          </div>
                          <p className="text-dark">Daily Tasks</p>
                        </Link>
                        <Link
                          to={routes.classlist}
                          className="d-block bg-secondary-transparent ronded p-1 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-secondary rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-secondary rounded-circle">
                              <i className="ti ti-license" />
                            </span>
                          </div>
                          <p className="text-dark">Classes</p>
                        </Link>
                      </div>
                      <div className="item">
                        <Link
                          to={`${routes.eventsdata}/${schoolId}`}
                          className="d-block bg-primary-transparent ronded p-1 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-primary rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-primary rounded-circle">
                              <i className="ti ti-hexagonal-prism" />
                            </span>
                          </div>
                          <p className="text-dark">School Events</p>
                        </Link>
                        <Link
                          to={`${routes.syllabusdata}/${schoolId}`}
                          className="d-block bg-danger-transparent ronded p-1 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-danger rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-danger rounded-circle">
                              <i className="ti ti-report-money" />
                            </span>
                          </div>
                          <p className="text-dark">Syllabus</p>
                        </Link>
                      </div>



                    </Slider>
                  </div>
                  <div className="card-body ">
                    <Slider
                      {...settings}
                      className="owl-carousel link-slider"
                    >
                      <div className="item">
                        <Link
                          to={`${routes.robocategoryforschooldas}/${schoolId}`}
                          className="d-block bg-primary-transparent ronded p-1 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-primary rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-primary rounded-circle">
                              <i className="ti ti-hexagonal-prism" />
                            </span>
                          </div>
                          <p className="text-dark">Robotics Category</p>
                        </Link>
                        <Link
                          to={`${routes.robosubcategoryforschooldas}/${schoolId}`}
                          className="d-block bg-danger-transparent ronded p-1 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-danger rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-warning rounded-circle">
                              <i className="ti ti-calendar" />
                            </span>
                          </div>
                          <p className="text-dark">Robotics Sub-Category</p>
                        </Link>
                      </div>
                      <div className="item">
                        <Link
                          to={`${routes.aicategoryforschooldas}/${schoolId}`}
                          className="d-block bg-primary-transparent ronded p-1 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-primary rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-secondary rounded-circle">
                              <i className="ti ti-license" />
                            </span>
                          </div>
                          <p className="text-dark">AI Category</p>
                        </Link>
                        <Link
                          to={`${routes.aisubcategoryforschooldas}/${schoolId}`}
                          className="d-block bg-danger-transparent ronded p-1 text-center mb-3 class-hover"
                        >
                          <div className="avatar avatar-lg border p-1 border-danger rounded-circle mb-2">
                            <span className="d-inline-flex align-items-center justify-content-center w-100 h-100 bg-danger rounded-circle">
                              <i className="ti ti-report-money" />
                            </span>
                          </div>
                          <p className="text-dark">AI Sub-Category</p>
                        </Link>
                      </div>


                    </Slider>
                  </div>
                </div>
                {/* /Quick Links */}


              </div>

            </div>
          </>
        </div>


      </div>


    </>
  );
};

export default SchoolDashboard;
