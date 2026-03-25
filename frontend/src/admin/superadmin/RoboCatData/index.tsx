import { useEffect, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link, useParams } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { allRoboCategoriesForSchoolDas } from "../../../service/api";
import { Spinner } from "../../../spinner";

const RoboCategoryForSchoolDas = () => {
    const route = all_routes
    const { schoolId } = useParams()

    const [allCategory, setAllCategory] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false)

    const fetchCategories = async (schoolId: number) => {
        setLoading(true)

        try {
            const { data } = await allRoboCategoriesForSchoolDas(schoolId)
            // console.log(data)
            if (data.success) {
                setAllCategory(data.data)

            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (schoolId) {
            fetchCategories(Number(schoolId))
        }

    }, [])



    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: any) => (
                <>
                    <Link to="#" className="link-primary">
                        CAT-{text}
                    </Link>
                </>
            ),
        },

        {
            title: "Category",
            dataIndex: "category",
            sorter: (a: any, b: any) => a.category.length - b.category.length,
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
                            <h3 className="page-title mb-1">Category List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.superadmindashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Categories </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Category
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        {/* <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            <div className="mb-2">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => setShowAddCategoryModal(true)}
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add Category
                                </button>
                            </div>
                        </div> */}
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Category List</h4>
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="input-icon-start mb-3 me-2 position-relative">

                                </div>

                            </div>
                        </div>
                        <div className="card-body p-0 py-3">

                            {loading ? (
                                <Spinner />
                            ) : (<Table columns={columns} dataSource={allCategory} Selection={false} />)
                            }

                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default RoboCategoryForSchoolDas;