import { useEffect, useState } from "react";
import Table from "../../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import { all_routes } from "../../../../router/all_routes";
import { deviceTypeCountWithData } from "../../../../service/api.ts";
import { Spinner } from "../../../../spinner.tsx";

const DeviceTypeList = () => {
    const route = all_routes
    const [deviceTypeList, setDeviceTypeList] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false)
    const fetchDeviceTypesList = async () => {
        setLoading(true)
        await new Promise((res) => setTimeout(res, 500))
        try {
            const { data } = await deviceTypeCountWithData()
            if (data.success) {
                setDeviceTypeList(data.data)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDeviceTypesList()
    }, [])

    const columns = [

        {
            title: "Category",
            dataIndex: "category",
            render: (text: any) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.category.length - b.category.length,
        },
        {
            title: "Sub-Category",
            dataIndex: "subcategory",
            render: (text: any) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.subcategory.length - b.subcategory.length,
        },
        {
            title: "Total Devices",
            dataIndex: "total",
            render: (text: any) => (
                <span>{text}</span>
            ),
            sorter: (a: any, b: any) => a.total - b.total,
        },

    ];



    return (
        <div>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Device Types List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Device Types </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Device Types
                                    </li>
                                </ol>
                            </nav>
                        </div>

                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Device Types List</h4>
                           
                        </div>
                        <div className="card-body p-0 py-3">
                            {/* Guardians List */}
                            {loading ? (
                                <Spinner />
                            ) : (<Table columns={columns} dataSource={deviceTypeList} Selection={false} />)
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

export default DeviceTypeList;