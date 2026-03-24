import { useEffect, useMemo, useState } from "react";
import Table from "../../../../core/common/dataTable/index";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../../router/all_routes";
import { AIDevicesForSchoolDas} from "../../../../service/api.ts";


import { Spinner } from "../../../../spinner.tsx";

import dayjs from 'dayjs'


export interface deviceData {
    id: number,
    device_name: string,
    device_code: string,
    category: string,
    sub_category: string,
    created_at: string,
    quantity: number
}
const AiDeviceForSchoolDas = () => {
    const route = all_routes
    const { schoolId } = useParams()
    const [devices, setDevices] = useState<deviceData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");


    const fetchdevices = async (schoolId: number) => {
        setLoading(true)

        try {
            const { data } = await AIDevicesForSchoolDas(schoolId)
            // console.log(data)
            if (data.success) {
                setDevices(data.data)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (schoolId) {
            fetchdevices(Number(schoolId))
        }


    }, [])


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
            render: (text: any) => (
                <>
                    <Link to="#" className="link-primary">
                        DE-{text}
                    </Link>
                </>
            ),
        },

        {
            title: "Device Name",
            dataIndex: "device_name",
            render: (text: any) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.device_name.length - b.device_name.length,
        },
        {
            title: "Device Code",
            dataIndex: "device_code",
            render: (text: any) => (
                <span>{text}</span>
            ),
            sorter: (a: any, b: any) => a.device_code.length - b.device_code.length,
        },
        {
            title: "Category",
            dataIndex: "category",
            render: (text: any) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.category.length - b.category.length,
        },
        {
            title: "Sub Category",
            dataIndex: "sub_category",
            render: (text: any) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.sub_category.length - b.sub_category.length,
        },

        {
            title: "Quantity",
            dataIndex: "quantity",
            render: (quantity: number) => (
                <span
                    className={`fw-bold  ${quantity <= 0 ? "text-danger" : "text-success"
                        }`}
                >
                    {quantity <= 0 ? "Out of Stock" : quantity}
                </span>
            ),
            sorter: (a: { quantity: number }, b: { quantity: number }) =>
                a.quantity - b.quantity,
        }
        ,

        {
            title: "Added On",
            dataIndex: "created_at",
            render: (text: any) => (
                <span>{dayjs(text).format('DD MMM YYYY')}</span>
            )
        },



        // {
        //   title: "Action",
        //   dataIndex: "action",
        //   render: () => (
        //     <>
        //       <div className="d-flex align-items-center">
        //         <div className="dropdown">
        //           <Link
        //             to="#"
        //             className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
        //             data-bs-toggle="dropdown"
        //             aria-expanded="false"
        //           >
        //             <i className="ti ti-dots-vertical fs-14" />
        //           </Link>
        //           <ul className="dropdown-menu dropdown-menu-right p-3">
        //             <li>
        //               <button
        //                 className="dropdown-item rounded-1"

        //               >
        //                 <i className="ti ti-edit-circle me-2" />
        //                 Edit
        //               </button>
        //             </li>
        //             <li>
        //               <button
        //                 className="dropdown-item rounded-1"


        //               >
        //                 <i className="ti ti-settings me-2" />
        //                 Manage Quantity
        //               </button>
        //             </li>
        //             <li>
        //               <button
        //                 className="dropdown-item rounded-1"


        //               >
        //                 <i className="ti ti-trash-x me-2" />
        //                 Delete
        //               </button>
        //             </li>
        //           </ul>
        //         </div>
        //       </div>
        //     </>
        //   ),
        // },
    ];



    return (
        <div>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Devices List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.superadmindashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Devices</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Devices
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        {/* <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            <div className="mb-2">
                                <button

                                    className="btn btn-primary"

                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add Device
                                </button>
                            </div>
                        </div> */}
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Devices List</h4>
                            <div className="d-flex align-items-center flex-wrap">

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
                                                className={`dropdown-item rounded-1 ${sortType === "asc" ? "active" : ""
                                                    }`}
                                                onClick={() => setSortType("asc")}
                                            >
                                                Ascending
                                            </button>
                                        </li>
                                        <li>
                                            <button
                                                className={`dropdown-item rounded-1 ${sortType === "desc" ? "active" : ""
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
                        <div className="card-body p-0 py-3">
                            {/* Guardians List */}
                            {loading ? (
                                <Spinner />
                            ) : (<Table key={sortType} columns={columns} dataSource={sortedDevices} Selection={false} />)
                            }
                            {/* /Guardians List */}
                        </div>
                    </div>
                    {/* /Guardians List */}
                </div>
            </div>
            {/* /Page Wrapper */}

        </div>
    );
};

export default  AiDeviceForSchoolDas ;