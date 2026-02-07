import React, { useEffect, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../../router/all_routes";
import { addSubCategory, allSubCategories, categoryForOption,  deleteSubCategory, getSpeSubCategory, updateSubCategory } from "../../../service/api";
import { toast } from "react-toastify";
import { handleModalPopUp } from "../../../handlePopUpmodal";
import { Spinner } from "../../../spinner";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import type { OptionType } from "../../../core/data/interface";



interface SubCategory {
    id: number;
    sub_category: string;
    category: string;
}


const SubCategory = () => {
    const route = all_routes

    const [allSubCategory, setAllSubCategory] = useState<SubCategory[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([])
    const [selectedCategory, setSelectedCategory] = useState<OptionType | null>(null);
    const [subCategories, setSubCategories] = useState<OptionType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [editData, setEditData] = useState<string>("")



    const fetchSubCategories = async () => {
        setLoading(true)
        await new Promise((res) => setTimeout(res, 500))
        try {
            const { data } = await allSubCategories()
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
    const fetchCategoryOption = async () => {
        try {

            const { data } = await categoryForOption()
            if (data.success) {
                setCategoryOptions(
                    data.data.map((opt: any) => ({
                        value: opt.id,
                        label: opt.category
                    }))
                );

            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchSubCategories()
        fetchCategoryOption()
    }, [])


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();


        if (!selectedCategory) {
            toast.error("Please select a category!");
            return;
        }

        if (!subCategories || subCategories.length === 0) {
            toast.error("Please add at least one sub-category!");
            return;
        }

        const payload: {
            category_id: number;
            subCategories: string[];
        } = {
            category_id: Number(selectedCategory.value),
            subCategories: subCategories.map((item: OptionType) => item.value.trim()).filter(Boolean),
        };

        if (payload.subCategories.length === 0) {
            toast.error("Sub-category names cannot be empty!");
            return;
        }

        try {
            setIsLoading(true);

            const { data } = await addSubCategory(payload);

            if (data.success) {
                toast.success(data.message);
                handleModalPopUp("add-sub-cat"); // close modal
                setSelectedCategory(null);
                setSubCategories([]);
            } else {
                // Server returned success: false
                toast.error(data.message || "Failed to add sub-categories");
            }
        } catch (error: any) {
            console.error("Add SubCategory Error:", error);
            toast.error(error?.response?.data?.message || "Internal server error");
        } finally {
            setIsLoading(false);
        }


    };


    const fetchSpecificCategory = async (id: number) => {

        try {
            const { data } = await getSpeSubCategory(id)
            console.log(data)
            setEditData(data.data.sub_category_name)
            setEditId(id)
        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message)
        }

    }

    const cancelAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setSelectedCategory(null)
        setSubCategories([])
    }


    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editData.trim() || !editId) {
            toast.warn('Sub categry name required !')
            return
        }
        if (editData.length < 3) {
            toast.warn('Sub categry name must be at least 3 chracters !')
            return
        }
        try {

            const { data } = await updateSubCategory({ sub_category_name: editData }, editId)
            if (data.success) {
                toast.success(data.message)
                setEditId(null)
                setEditData("")
                fetchSubCategories()
                handleModalPopUp('edit_sub')
            }

        } catch (error: any) {
            console.log(error)
            toast.error(error.response.data.message)
        }
    }


    const cancelEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setEditId(null)
        setEditData("")
    }



    // delete class--------------------------------------------------------------------
    const [deleteId, setDeleteId] = useState<number | null>(null)
    const handleDelete = async (id: number, e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        console.log(id)
        try {
            const { data } = await deleteSubCategory(id)
            if (data.success) {
                setDeleteId(null)
                toast.success(data.message)
                fetchSubCategories()
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
                                        data-bs-target="#edit_sub"
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
                            <h3 className="page-title mb-1">Sub-Category List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.adminDashboard}>Dashboard</Link>
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
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            <div className="mb-2">
                                <Link
                                    to="#"
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target="#add-sub-cat"
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add Sub-Category
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Sub-Category List</h4>
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="input-icon-start mb-3 me-2 position-relative">

                                </div>

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
                                </div>
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
            {/* /Page Wrapper */}
            <>
                {/* Add Classes */}
                <div className="modal fade" id="add-sub-cat">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">

                            {/* Header */}
                            <div className="modal-header">
                                <h4 className="modal-title">Add Sub-Category</h4>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                ></button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">

                                    {/* Category */}
                                    <div className="mb-3">
                                        <label className="form-label">Category Name</label>
                                        <Select<OptionType, false>
                                            options={categoryOptions}
                                            value={selectedCategory}
                                            onChange={(option) => setSelectedCategory(option)}
                                            placeholder="Select Category"
                                            className="text-capitalize"
                                        />
                                    </div>
                                    {/* Sub Category */}
                                    <div className="mb-3">
                                        <label className="form-label">
                                            Sub Categories
                                        </label>
                                        <CreatableSelect<OptionType, true>
                                            isMulti
                                            value={subCategories}
                                            onChange={(options) => setSubCategories(options ? [...options] : [])}
                                            placeholder="Type sub-category & press enter"
                                        />
                                    </div>
                                </div>
                                {/* Footer */}
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={(e) => cancelAdd(e)}
                                        className="btn btn-light me-1"
                                        data-bs-dismiss="modal"
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                        {isLoading ? "Adding..." : "Add Sub-Category"}
                                    </button>

                                </div>
                            </form>

                        </div>
                    </div>
                </div>
                {/* /Add Classes */}


                {/* Edit Classes */}
                <div className="modal fade" id="edit_sub">
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

                            <form onSubmit={handleUpdate}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-12">
                                            {/* Class Name */}
                                            <div className="mb-3">
                                                <label className="form-label">Sub-Category Name</label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    name="category"
                                                    value={editData}
                                                    autoComplete="off"
                                                    onChange={(e) => setEditData(e.target.value)}
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
                                        Edit SubCategory
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
                                        You want to delete this sub-category, this cant be undone once
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

export default SubCategory;