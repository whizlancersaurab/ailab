import { useEffect, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../../router/all_routes";
import { addCategory, allCategories, deleteCategory, speCategory, updateCategory } from "../../../service/api";
import { toast } from "react-toastify";
import { handleModalPopUp } from "../../../handlePopUpmodal";
import { Spinner } from "../../../spinner";



interface CategoryFormData {
    category: string;
}


const Category = () => {
    const route = all_routes

    const [allCategory, setAllCategory] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false)

    const fetchCategories = async () => {
        setLoading(true)
        await new Promise((res) => setTimeout(res, 500))
        try {
            const { data } = await allCategories()
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
        fetchCategories()
    }, [])

    const [formData, setFormData] = useState<CategoryFormData>({
        category: "",

    });
    const [editId, setEditId] = useState<number | null>(null)

    // ✅ Generic handleChange for inputs
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, value} = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const fetchSpecificCategory = async (id: number) => {

        try {
            const { data } = await speCategory(id)
            setFormData({
                category: data.data.category,
            }
            )
            setEditId(id)
        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message)
        }

    }

    const cancelEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setFormData({
            category: "",
            
        });
        setEditId(null)
    }

    // ✅ Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.category.trim()) {
            toast.warn('Category name must be required !')
            return
        } else if (formData.category.length < 3) {
            toast.warn('Category name must be at least 3 chracters!')
            return
        }
        try {

            const apiCall = editId ? updateCategory(formData, editId) : addCategory(formData)
            const { data } = await apiCall

            if (data.success) {
                toast.success(data.message)
                handleModalPopUp(editId ? 'edit_class' : 'add_class')
                setEditId(null)
            }
            fetchCategories()
            setFormData({
                category: "",
            })

        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }

    };

    // delete class--------------------------------------------------------------------
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        console.log(id)
        try {
            const { data } = await deleteCategory(id)
            if (data.success) {
                setDeleteId(null)
                toast.success(data.message)
                fetchCategories()
                handleModalPopUp('delete-modal')

            }

        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }

    const cancelDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setDeleteId(null)
    }

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

      
        {
            title: "Action",
            dataIndex: "action",
            render: (_: any, record: any) => (
                <>
                    <div className="d-flex align-items-center">
                        <div className="dropdown">
                            <Link
                                to="#"
                                className="btn btn-white btn-icon btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                <i className="ti ti-dots-vertical fs-14" />
                            </Link>
                            <ul className="dropdown-menu dropdown-menu-right p-3">
                                <li>
                                    <button
                                        className="dropdown-item rounded-1"
                                        onClick={() => fetchSpecificCategory(record.id)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#edit_class"
                                    >
                                        <i className="ti ti-edit-circle me-2" />
                                        Edit
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item rounded-1"
                                        onClick={() => setDeleteId(record.id)}
                                        data-bs-toggle="modal"
                                        data-bs-target="#delete-modal"
                                    >
                                        <i className="ti ti-trash-x me-2" />
                                        Delete
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </>
            ),
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
                                        <Link to={route.adminDashboard}>Dashboard</Link>
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
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            <div className="mb-2">
                                <Link
                                    to="#"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add_class"
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add Category
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Category List</h4>
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
                            ) : (<Table columns={columns} dataSource={allCategory} Selection={false} />)
                            }
                            {/* /Guardians List */}
                        </div>
                    </div>
                    {/* /Guardians List */}
                </div>
            </div>
            {/* /Page Wrapper */}
            <>
                {/* Add Classes */}
                <div className="modal fade" id="add_class">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Add Category</h4>
                                <button
                                    type="button"
                                    className="btn-close custom-btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <i className="ti ti-x" />
                                </button>
                            </div>


                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            {/* Class Name */}
                                            <div className="mb-3">
                                                <label className="form-label">Category Name</label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    name="category"
                                                    value={formData.category}
                                                    autoComplete="off"
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={(e) => cancelEdit(e)}
                                        className="btn btn-light me-2"
                                        data-bs-dismiss="modal"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"

                                    >
                                        Add Category
                                    </button>
                                </div>
                            </form>


                        </div>
                    </div>
                </div>
                {/* /Add Classes */}


                {/* Edit Classes */}
                <div className="modal fade" id="edit_class">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h4 className="modal-title">Edit Category</h4>
                                <button
                                    type="button"
                                    className="btn-close custom-btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <i className="ti ti-x" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            {/* Class Name */}
                                            <div className="mb-3">
                                                <label className="form-label">Category Name</label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    name="category"
                                                    value={formData.category}
                                                    autoComplete="off"
                                                    onChange={handleChange}
                                                />
                                            </div>

                                            {/* Status Switch */}
                                            {/* <div className="d-flex align-items-center justify-content-between">
                                                <div className="status-title">
                                                    <h5>Status</h5>
                                                    <p>Change the Status by toggle</p>
                                                </div>
                                                <div className="form-check form-switch">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        role="switch"
                                                        id="switch-sm2"
                                                        name="status"
                                                        checked={formData.status === 1}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                            </div> */}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={(e) => cancelEdit(e)}
                                        className="btn btn-light me-2"
                                        data-bs-dismiss="modal"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"

                                    >
                                        Edit Category
                                    </button>
                                </div>
                            </form>


                        </div>
                    </div>
                </div>
                {/* /Edit category */}
                {/* Delete Modal */}
                <div className="modal fade" id="delete-modal">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form>
                                <div className="modal-body text-center">
                                    <span className="delete-icon">
                                        <i className="ti ti-trash-x" />
                                    </span>
                                    <h4>Confirm Deletion</h4>
                                    <p>
                                        You want to delete this category, this cant be undone once
                                        you delete.
                                    </p>
                                    {
                                        deleteId && (
                                            <div className="d-flex justify-content-center">
                                                <button
                                                    onClick={(e) => cancelDelete(e)}
                                                    className="btn btn-light me-3"
                                                    data-bs-dismiss="modal"
                                                >
                                                    Cancel
                                                </button>
                                                <button className="btn btn-danger" onClick={(e) => handleDelete(deleteId, e)}>
                                                    Yes, Delete
                                                </button>

                                            </div>
                                        )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                {/* /Delete Modal */}

            </>
        </div>
    );
};

export default Category;