import React, { useEffect, useMemo, useRef, useState } from "react";
import Table from "../../../core/common/dataTable/index";
import { Link, useParams } from "react-router-dom";
import TooltipOption from "../../../core/common/tooltipOption";
import { all_routes } from "../../../router/all_routes";
import {classForOption, dailyTasksForSchoolDas } from "../../../service/api.ts";
import { Spinner } from "../../../spinner.tsx";
import type { OptionType, TasksData } from "../../../core/data/interface/index.tsx";
import Select from "react-select";
import dayjs from 'dayjs'




const DailyTaskForSchoolDas = () => {
    const route = all_routes
    const { schoolId } = useParams()
    const [tasksList, setTasksList] = useState<TasksData[]>([])
    const [originalTaskList, setOriginalTaskList] = useState<TasksData[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [classOptions, setClassOptions] = useState<OptionType[]>([])
    const [sortType, setSortType] = useState<"asc" | "desc">("asc");

    const fetchTasks = async (schoolId:number) => {
        setLoading(true)

        try {
            const { data } = await dailyTasksForSchoolDas(schoolId)
            if (data.success) {
                setTasksList(data.data)
                setOriginalTaskList(data.data)
            }

        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const fetchClassForOption = async () => {
        try {

            const { data } = await classForOption()
            if (data.success) {
                setClassOptions(data.data.map((c: any) => ({ value: c.id, label: c.class_name })))
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
         fetchClassForOption()
        if (schoolId) {
            fetchTasks(Number(schoolId))
        }

       
    }, [])


    const sortedDevices = useMemo(() => {
        const copy = [...tasksList];

        copy.sort((a, b) => {
            return sortType === "asc"
                ? a.id - b.id
                : b.id - a.id;
        });

        return copy;
    }, [tasksList, sortType]);



    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            render: (text: any) => (
                <>
                    <Link to="#" className="link-primary">
                        DT-{text}
                    </Link>
                </>
            ),
        },

        {
            title: "Class",
            dataIndex: "className",
            render: (text: any) => (
                <span>{`Class-${text}`}</span>
            ),
            sorter: (a: any, b: any) => a.className.length - b.className.length,
        },

        {
            title: "Month No",
            dataIndex: "month_no",
            render: (text: number) => (
                <span>{text}</span>
            ),
            sorter: (a: any, b: any) => a.month_no - b.month_no,
        },

        {
            title: "Task Title",
            dataIndex: "taskTitle",
            render: (text: any) => (
                <span>{`${text}`}</span>
            ),
            sorter: (a: any, b: any) => a.taskTitle.length - b.taskTitle.length,
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (status: string) => (
                <span
                    className={`badge ${status === 'COMPLETED'
                        ? 'bg-success' : 'bg-primary'}`}
                >
                    {status}
                </span>
            ),
            sorter: (a: any, b: any) => a.status.length - b.status.length,
        },
        {
            title: "Added On",
            dataIndex: "created_at",
            render: (text: any) => (
                <span>{dayjs(text).format('DD MMM YYYY')}</span>
            ),

        },

    ];

    // filter data

    interface FilterData {
        className: number | null;
    }

    const [filterData, setFilterData] = useState<FilterData>({ className: null });

    const handleFilterSelectChange = (name: keyof FilterData, value: null | number) => {
        setFilterData((prev) => ({ ...prev, [name]: value }));
    };

    const dropdownMenuRef = useRef<HTMLDivElement | null>(null);

    const handleApplyClick = (e: React.FormEvent) => {
        e.preventDefault();

        const filtered = originalTaskList.filter((row: any) => {
            if (filterData.className !== null) {
                return Number(row.className) === Number(filterData.className);
            }
            return true;
        });

        setTasksList([...filtered]);
        setFilterData({ className: null });
        if (dropdownMenuRef.current) {
            dropdownMenuRef.current.classList.remove("show");
        }
    };


    const handleResetFilter = (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.preventDefault();
        setFilterData({ className: null });
        setTasksList(originalTaskList);
        if (dropdownMenuRef.current) {
            dropdownMenuRef.current.classList.remove("show");
        }
    };



    return (
        <div>
            {/* Page Wrapper */}
            <div className="page-wrapper">
                <div className="content">
                    {/* Page Header */}
                    <div className="d-md-flex d-block align-items-center justify-content-between mb-3">
                        <div className="my-auto mb-2">
                            <h3 className="page-title mb-1">Daily-Tasks List</h3>
                            <nav>
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item">
                                        <Link to={route.superadmindashboard}>Dashboard</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        <Link to="#">Daily-Tasks </Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        All Tasks
                                    </li>
                                </ol>
                            </nav>
                        </div>
                        <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                            <TooltipOption />
                            {/* <div className="mb-2">
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                     onClick={()=>setAddModal(true)}
                                >
                                    <i className="ti ti-square-rounded-plus-filled me-2" />
                                    Add Task
                                </button>
                            </div> */}
                        </div>
                    </div>
                    {/* /Page Header */}
                    {/* Guardians List */}
                    <div className="card">
                        <div className="card-header d-flex align-items-center justify-content-between flex-wrap pb-0">
                            <h4 className="mb-3">Tasks List</h4>
                            <div className="d-flex align-items-center flex-wrap">
                                <div className="dropdown mb-3 me-2">
                                    <Link
                                        to="#"
                                        className="btn btn-outline-light bg-white dropdown-toggle"
                                        data-bs-toggle="dropdown"
                                        data-bs-auto-close="outside"
                                    >
                                        <i className="ti ti-filter me-2" />
                                        Filter
                                    </Link>
                                    <div className="dropdown-menu drop-width" ref={dropdownMenuRef}>


                                        <form >
                                            <div className="d-flex align-items-center border-bottom p-3">
                                                <h4>Filter</h4>
                                            </div>
                                            <div className="p-3 border-bottom pb-0">
                                                <div className="row">
                                                    <div className="col-md-12">
                                                        <div className="mb-3">
                                                            <label className="form-label">ClassName</label>
                                                            <Select
                                                                className="select"
                                                                options={classOptions} // [{ value: 1, label: "Class 1" }, ...]
                                                                placeholder="Select class"
                                                                value={classOptions.find(option => Number(option.value) === filterData.className) || null} // <-- make it controlled
                                                                onChange={(option: any) =>
                                                                    handleFilterSelectChange("className", option ? option.value : null)
                                                                }
                                                            />

                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-3 d-flex align-items-center justify-content-end">
                                                <button type="button" onClick={(e) => handleResetFilter(e)} className="btn btn-light me-3">
                                                    Reset
                                                </button>
                                                <button
                                                    // to="#"
                                                    className="btn btn-primary"
                                                    onClick={handleApplyClick}
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </form>
                                    </div>
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
                            ) : (<Table key={sortType + Math.floor(Math.random() * 100000)} columns={columns} dataSource={sortedDevices} Selection={false} />)
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

export default DailyTaskForSchoolDas;