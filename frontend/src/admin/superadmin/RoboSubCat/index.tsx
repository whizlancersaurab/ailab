import { useEffect, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { allRoboSubCategoriesForSchoolDas } from "../../../service/api";
import { Spinner } from "../../../spinner";


interface SubCategory {
    id: number;
    sub_category: string;
    category: string;
}


const RoboSubCategoryForSchoolDas = () => {
    const route = all_routes
    const { schoolId } = useParams()
    const [allSubCategory, setAllSubCategory] = useState<SubCategory[]>([])
    const [loading, setLoading] = useState<boolean>(false)

    const fetchSubCategories = async (schoolId: number) => {
        setLoading(true)

        try {
            const { data } = await allRoboSubCategoriesForSchoolDas(schoolId)
            // console.log(data)
            if (data.success) {
                setAllSubCategory(data.data)

            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        if (schoolId) {
            fetchSubCategories(Number(schoolId))
        }


    }, [])

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: any) => (
                <>
                    <Link to="#" className="link-primary">
                        SUBCAT-{text}
                    </Link>
                </>
            ),
            sorter: (a: any, b: any) => a.id - b.id,
        },

        {
            title: "Category",
            dataIndex: "category",
            render: (text: string) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.category.length - b.category.length,
        },

        {
            title: "Sub-Category",
            dataIndex: "sub_category",
            render: (text: string) => (
                <span className="text-capitalize">{text}</span>
            ),
            sorter: (a: any, b: any) => a.sub_category.length - b.sub_category.length,
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
                            <h3 className="page-title mb-1">Sub-Category List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.superadmindashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Sub-Categories </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Sub-Category
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        {/* <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            <div className="mb-2">
                                <button
                                    
                                    className="btn btn-primary"
                                     onClick={()=>setShowAddCategoryModal(true)}
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add Sub-Category
                                </button>
                            </div>
                        </div> */}
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Sub-Category List</h4>
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="input-icon-start mb-3 me-2 position-relative">

                                </div>

                                {/* <div className="dropdown mb-3">
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
                                            <Link to="#" className="dropdown-item rounded-1 active">
                                                Ascending
                                            </Link>
                                        </li>
                                        <li>
                                            <Link to="#" className="dropdown-item rounded-1">
                                                Descending
                                            </Link>
                                        </li>

                                    </ul>
                                </div> */}
                            </div>
                        </div>
                        <div className="card-body p-0 py-3">
                            {/* Guardians List */}
                            {loading ? (
                                <Spinner />
                            ) : (<Table columns={columns} dataSource={allSubCategory} Selection={false} />)
                            }
                            {/* /Guardians List */}
                        </div>
                    </div>
                    {/* /Guardians List */}
                </div>
            </div>

        </div>
    );
};

export default RoboSubCategoryForSchoolDas;