import { useEffect, useMemo, useState } from "react";
import Table from "../../../../core/common/dataTable";
import { Link } from "react-router-dom";
import TooltipOption from "../../../../core/common/tooltipOption";
import { all_routes } from "../../../../router/all_routes";
import { OutOfStockDevices } from "../../../../service/api";
import { Spinner } from "../../../../spinner";
import dayjs from "dayjs";

export interface deviceData {
  id: number;
  device_name: string;
  device_code: string;
  category: string;
  sub_category: string;
  created_at: string;
}

const OutOfStockDevice = () => {
  const route = all_routes;

  const [devices, setDevices] = useState<deviceData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [sortType, setSortType] = useState<"asc" | "desc">("asc");

 
  const fetchdevices = async () => {
    setLoading(true);
    try {
      const { data } = await OutOfStockDevices();
      if (data?.success) {
        setDevices(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchdevices();
  }, []);

 
  const sortedDevices = useMemo(() => {
    const copy = [...devices];
    copy.sort((a, b) => {
      const A = a.device_name.toLowerCase();
      const B = b.device_name.toLowerCase();
      return sortType === "asc"
        ? A.localeCompare(B)
        : B.localeCompare(A);
    });
    return copy;
  }, [devices, sortType]);

 
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text: number) => (
        <Link to="#" className="link-primary">
          DE-{text}
        </Link>
      ),
    },
    {
      title: "Device Name",
      dataIndex: "device_name",
      render: (text: string) => (
        <span className="text-capitalize">{text}</span>
      ),
    },
    {
      title: "Device Code",
      dataIndex: "device_code",
    },
    {
      title: "Category",
      dataIndex: "category",
      render: (text: string) => (
        <span className="text-capitalize">{text}</span>
      ),
    },
    {
      title: "Sub Category",
      dataIndex: "sub_category",
      render: (text: string) => (
        <span className="text-capitalize">{text}</span>
      ),
    },
    {
      title: "Added On",
      dataIndex: "created_at",
      render: (text: string) => (
        <span>{dayjs(text).format("DD MMM YYYY")}</span>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">

        {/* ================= HEADER ================= */}
        <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
          <div className="my-auto mb-2">
            <h3 className="page-title mb-1">Devices List</h3>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to={route.adminDashboard}>Dashboard</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="#">Devices</Link>
                </li>
                <li className="breadcrumb-item active">
                  Out Of Stock Devices
                </li>
              </ol>
            </nav>
          </div>
          <TooltipOption />
        </div>

        <div className="card">
          <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
            <h4 className="mb-3">Out Of Stock Devices</h4>

            <div className="d-flex align-items-center flex-wrap">
              {/* FILTER (future) */}
              <div className="dropdown mb-3 me-2">
                {/* <Link
                  to="#"
                  className="btn btn-outline-light bg-white dropdown-toggle"
                  data-bs-toggle="dropdown"
                  data-bs-auto-close="outside"
                >
                  <i className="ti ti-filter me-2" />
                  Filter
                </Link> */}
              </div>

              {/* 🔥 SORT DROPDOWN (WORKING) */}
              <div className="dropdown mb-3">
                <Link
                  to="#"
                  className="btn btn-outline-light bg-white dropdown-toggle"
                  data-bs-toggle="dropdown"
                >
                  <i className="ti ti-sort-ascending-2 me-2" />
                  Sort by A-Z
                </Link>
                <ul className="dropdown-menu p-3">
                  <li>
                    <button
                      className={`dropdown-item rounded-1 ${
                        sortType === "asc" ? "active" : ""
                      }`}
                      onClick={() => setSortType("asc")}
                    >
                      Ascending
                    </button>
                  </li>
                  <li>
                    <button
                      className={`dropdown-item rounded-1 ${
                        sortType === "desc" ? "active" : ""
                      }`}
                      onClick={() => setSortType("desc")}
                    >
                      Descending
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* ================= TABLE ================= */}
          <div className="card-body p-0 py-3">
            {loading ? (
              <Spinner />
            ) : (
              <Table
                key={sortType}  
                columns={columns}
                dataSource={sortedDevices}
                Selection={false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutOfStockDevice;
