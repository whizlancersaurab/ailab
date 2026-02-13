import { useEffect, useState } from "react";
import Table from "../../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
// import TooltipOption from "../../../../core/common/tooltipOption";
import { all_routes } from "../../../../router/all_routes";
import { addClass, allClasses, deleteClass, editClass, speClass } from "../../../../service/api.ts";
// allClasses
import { toast } from "react-toastify";
import { Spinner } from "../../../../spinner.tsx";
import type { RootState } from "../../../../core/data/redux/store.tsx";
import { useSelector } from "react-redux";



const Classes = () => {
    const route = all_routes
    const [classList, setClassList] = useState<any>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [addModal, setAddModal] = useState<boolean>(false)

    const { role } = useSelector((state: RootState) => state.authSlice)


    const fetchClasses = async () => {
        setLoading(true)
        try {
            const { data } = await allClasses()
            // console.log(data)
            if (data.success) {
                setClassList(data.data)


            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        fetchClasses()

    }, [])


    interface ClassFormData {
        className: string;
    }

    const [formData, setFormData] = useState<ClassFormData>({
        className: "",

    });
    const [editId, setEditId] = useState<number | null>(null)
    const [editModal, setEditModal] = useState<boolean>(false)


    // ✅ Generic handleChange for inputs
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ): void => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
        }));
    };

    const fetchSpecificClass = async (id: number) => {

        try {
            const { data } = await speClass(id)
            if (data.success) {
                setFormData({
                    className: data.data.className,
                }
                )
                setEditId(id)
                setEditModal(true)
            }

        } catch (error) {
            console.log(error)
        }

    }

    const cancelEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setFormData({
            className: "",
        });
        // setErrors({});
        setEditId(null)
        setEditModal(false)
    }

    // ✅ Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.className.trim()) {
            toast.warn('Classname must be required !')
            return
        }
        try {
            if (editId) {
                const { data } = await editClass(formData, editId)

                if (data.success) {
                    toast.success(data.message)

                    setEditId(null)
                }

            } else {

                const { data } = await addClass(formData)
                if (data.success) {
                    toast.success(data.message)

                }
            }
            fetchClasses()
            setFormData({
                className: "",

            })
            setEditModal(false)
            setAddModal(false)


        } catch (error) {
            console.log(error)

        }

    };

    // delete class--------------------------------------------------------------------
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const [delModal, setDelModal] = useState<boolean>(false)

    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        try {
            const { data } = await deleteClass(id)
            if (data.success) {
                setDeleteId(null)
                toast.success(data.message)
                fetchClasses()
                setDelModal(false)

            }

        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }

    const cancelDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setDeleteId(null)
        setDelModal(false)
    }


    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: any) => (
                <Link to="#" className="link-primary">
                    CL{text}
                </Link>
            ),
        },
        {
            title: "Class",
            dataIndex: "className",
            render: (text: any) => <span>{`Class-${text}`}</span>,
            sorter: (a: any, b: any) => a.className.length - b.className.length,
        },
        ...(role === "SUPER_ADMIN"
            ? [
                {
                    title: "Action",
                    dataIndex: "action",
                    render: (_: any, record: any) => (
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
                                            onClick={() => fetchSpecificClass(record.id)}
                                        >
                                            <i className="ti ti-edit-circle me-2" />
                                            Edit
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            className="dropdown-item rounded-1"
                                            onClick={() => {
                                                setDeleteId(record.id);
                                                setDelModal(true);
                                            }}
                                        >
                                            <i className="ti ti-trash-x me-2" />
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ),
                },
            ]
            : []),
    ];



    return (
        <div>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Classes List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.adminDashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Classes </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Classes
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            {/* <TooltipOption /> */}
                            <div className="mb-2">
                                {
                                    role === 'SUPER_ADMIN' && (<button
                                        onClick={() => setEditModal(true)}
                                        className="btn btn-primary"
                                    >
                                        <i className="ti ti-square-rounded-plus-filled me-2" />
                                        Add Class
                                    </button>)
                                }

                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Classes List</h4>
                            <div className="d-flex align-items-center flex-wrap">
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
                            ) : (<Table columns={columns} dataSource={classList} Selection={false} />)
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
                {
                    addModal && (<div className="modal fade" id="add_class">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title">Add Class</h4>
                                    <button
                                        type="button"
                                        className="btn-close custom-btn-close"
                                        onClick={() => setAddModal(false)}
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
                                                    <label className="form-label">Class Name</label>
                                                    <input
                                                        className="form-control"
                                                        type="number"
                                                        name="className"
                                                        value={formData.className}
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
                                            className="btn btn-light me-2"
                                            onClick={() => setAddModal(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"

                                        >
                                            Add Class
                                        </button>
                                    </div>
                                </form>


                            </div>
                        </div>
                    </div>)
                }
                {/* /Add Classes */}


                {/* Edit Classes */}
                {
                    editModal && (<div className="modal fade show d-block" id="edit_class">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h4 className="modal-title">Edit Class</h4>
                                    <button
                                        type="button"
                                        className="btn-close custom-btn-close"
                                        onClick={(e) => cancelEdit(e)}
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
                                                    <label className="form-label">Class Name</label>
                                                    <input
                                                        className="form-control"
                                                        type="number"
                                                        name="className"
                                                        value={formData.className}
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

                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"

                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>


                            </div>
                        </div>
                    </div>)
                }
                {/* /Edit Classes */}
                {/* Delete Modal */}
                {
                    delModal && (<div className="modal fade show d-block" id="delete-modal">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <form>
                                    <div className="modal-body text-center">
                                        <span className="delete-icon">
                                            <i className="ti ti-trash-x" />
                                        </span>
                                        <h4>Confirm Deletion</h4>
                                        <p>
                                            You want to delete this items, this cant be undone once
                                            you delete.
                                        </p>
                                        {
                                            deleteId && (
                                                <div className="d-flex justify-content-center">
                                                    <button
                                                        onClick={(e) => cancelDelete(e)}
                                                        className="btn btn-light me-3"

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
                    </div>)
                }
                {/* /Delete Modal */}

            </>
        </div>
    );
};

export default Classes;