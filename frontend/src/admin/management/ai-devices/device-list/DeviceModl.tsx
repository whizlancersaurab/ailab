import React, { useEffect, useState } from "react";
import Select from "react-select";
import type { OptionType } from "../../../../core/data/interface";
import { addAiDevice, addQuantityAi, aiCategoryForOption, AiSubcategoryForOption, speAiDevice, updateAiDevice } from "../../../../service/api";
import { toast } from "react-toastify";
import { handleModalPopUp } from "../../../../handlePopUpmodal";

interface FormErrors {
    deviceName?: string;
    deviceCode?: string;
    category?: string;
    subcategory?: string;
    quantity?: string;
}

type props = {
    editId?: number | null,
    addQuantityId?: number | null,
    onAdd?: () => void
    setEditId?: React.Dispatch<React.SetStateAction<number | null>>;
    setAddQuantityId?: React.Dispatch<React.SetStateAction<number | null>>;
    actualQuantity?:number
}

const DeviceModal: React.FC<props> = ({ onAdd, editId, setEditId, actualQuantity,addQuantityId, setAddQuantityId }) => {
    // FORM STATE
    const [deviceName, setDeviceName] = useState("");
    const [deviceCode, setDeviceCode] = useState("");
    const [category, setCategory] = useState<number | null>(null);
    const [subcategory, setSubcategory] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(0)
    

    const [errors, setErrors] = useState<FormErrors>({});
    const [categoryOptions, setCategoryOptions] = useState<OptionType[]>([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState<OptionType[]>([]);


    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!deviceName.trim()) {
            newErrors.deviceName = "Device name is required";
        } else if (deviceName.length < 3) {
            newErrors.deviceName = "Minimum 3 characters required";
        }

        if (!deviceCode.trim()) {
            newErrors.deviceCode = "Device code is required";
        }

        if (!category) {
            newErrors.category = "Category is required";
        }

        if (!subcategory) {
            newErrors.subcategory = "Sub category is required";
        }
        if (quantity < 0) {
            newErrors.quantity = "Quantity should Not be less than 0 !";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const payload = {
            device_name: deviceName,
            device_code: deviceCode,
            category_id: category,
            sub_category_id: subcategory,
            quantity: quantity
        };
        try {

            const apiCall = editId ? updateAiDevice(payload, editId) : addAiDevice(payload)

            const { data } = await apiCall
            if (data.success) {
                toast.success(data.message)
                setCategory(null)
                setSubcategory(null)
                setDeviceCode("")
                setDeviceName("")
                setErrors({})
                if (onAdd) onAdd()
                if (setEditId) setEditId(null)
                handleModalPopUp('addDeviceModal')
            }
        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    };

    const fetchCategoryOption = async () => {
        try {
            const { data } = await aiCategoryForOption();
            if (data.success) {
                setCategoryOptions(
                    data.data.map((opt: any) => ({
                        value: opt.id,
                        label: opt.category,
                    }))
                );
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleCategoryChange = async (option: OptionType | null) => {
        if (!option) return;
        setCategory(Number(option.value));
        setSubcategory(null);
        setErrors((prev) => ({ ...prev, category: undefined, subcategory: undefined }));
        handleSubCategory(Number(option.value))
    };

    const handleSubCategory = async (id: number) => {
        try {
            const { data } = await AiSubcategoryForOption(id);
            setSubCategoryOptions(
                data.data.map((sub: any) => ({
                    label: sub.sub_category_name,
                    value: sub.id,
                }))
            );

        } catch (error) {
            console.log(error)
        }
    }

    // fetch spe device for edit
    const fetchSpeDevice = async (id: number) => {
        try {
            const { data } = await speAiDevice(id)
            if (data.success) {
                setDeviceCode(data.data.device_code)
                setDeviceName(data.data.device_name)
                setCategory(data.data.category_id)
                handleSubCategory(data.data.category_id)
                setSubcategory(data.data.sub_category_id)
                setQuantity(data.data.quantity)
               
            }
        } catch (error: any) {
            console.log(error)
            toast.error(error?.response?.data?.message)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            await fetchCategoryOption();
            if (editId) {
                await fetchSpeDevice(editId);
            }
        };

        fetchData();
    }, [editId]);

    const cancelEditOrAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setCategory(null)
        setSubcategory(null)
        setQuantity(0)
        setDeviceCode("")
        setDeviceName("")
        setErrors({})
        if (setEditId) setEditId(null)

    }

    // add quantiy
    const handleAddQuantity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addQuantityId) return;
      if (actualQuantity === null || actualQuantity === undefined) return;

        if (quantity < 0 && Math.abs(quantity) > actualQuantity) {
            toast.error(`You are trying to manage more than your actual data !`);
            return;
        }

        try {

            const { data } = await addQuantityAi({ quantity: quantity }, addQuantityId)
            if (data.success) {
                toast.success(data.message)
                setQuantity(0)
               
                if (setAddQuantityId) setAddQuantityId(null)
                if (onAdd) onAdd()
                handleModalPopUp('add-quantity')
            }

        } catch (err: any) {
            console.log(err);
            toast.error(err?.response?.data?.message)
        }
    };
    const handleCancelAddQuantity = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setQuantity(0)
       
        if (setAddQuantityId) setAddQuantityId(null)

    }


    return (
        <>
            <div
                className="modal fade"
                id="addDeviceModal"
                tabIndex={-1}
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">

                        <form onSubmit={handleSubmit}>
                            {/* HEADER */}
                            <div className="modal-header">
                                <h5 className="modal-title">{`${editId ? "Edit" : "Add"} Device`}</h5>
                                <button type="button" onClick={cancelEditOrAdd} className="btn-close" data-bs-dismiss="modal" />
                            </div>

                            {/* BODY */}
                            <div className="modal-body">

                                {/* DEVICE NAME */}
                                <div className="mb-3">
                                    <label className="form-label">Device Name</label>
                                    <input
                                        className={`form-control ${errors.deviceName ? "is-invalid" : ""}`}
                                        value={deviceName}
                                        onChange={(e) => setDeviceName(e.target.value)}
                                        placeholder="Device name"
                                    />
                                    {errors.deviceName && (
                                        <div className="invalid-feedback">{errors.deviceName}</div>
                                    )}
                                </div>

                                {/* DEVICE CODE */}
                                <div className="mb-3">
                                    <label className="form-label">Device Code</label>
                                    <input
                                        className={`form-control ${errors.deviceCode ? "is-invalid" : ""}`}
                                        value={deviceCode}
                                        onChange={(e) => setDeviceCode(e.target.value)}
                                        placeholder="Device code"
                                    />
                                    {errors.deviceCode && (
                                        <div className="invalid-feedback">{errors.deviceCode}</div>
                                    )}
                                </div>

                                {/* CATEGORY */}
                                <div className="mb-3">
                                    <label className="form-label">Category</label>
                                    <Select
                                        options={categoryOptions}
                                        value={categoryOptions.find((i: any) => i.value === category)}
                                        onChange={(opt: any) => handleCategoryChange(opt)}
                                        placeholder="Select Category"
                                        classNamePrefix={errors.category ? "is-invalid-select" : ""}
                                    />
                                    {errors.category && (
                                        <small className="text-danger">{errors.category}</small>
                                    )}
                                </div>

                                {/* SUB CATEGORY */}
                                <div className="mb-3">
                                    <label className="form-label">Sub Category</label>
                                    <Select
                                        options={subCategoryOptions}
                                        value={subCategoryOptions.find((i: any) => i.value === subcategory)}
                                        onChange={(opt: any) => {
                                            setSubcategory(opt ? opt.value : null);
                                            setErrors((prev) => ({ ...prev, subcategory: undefined }));
                                        }}
                                        isDisabled={!category}
                                        placeholder="Select Sub Category"
                                    />
                                    {errors.subcategory && (
                                        <small className="text-danger">{errors.subcategory}</small>
                                    )}
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        className={`form-control ${errors.quantity ? "is-invalid" : ""}`}
                                        value={quantity}
                                        type="number"
                                        min={0}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        placeholder="Device qunatity"
                                    />
                                    {errors.quantity && (
                                        <div className="invalid-feedback">{errors.quantity}</div>
                                    )}
                                </div>

                            </div>

                            {/* FOOTER */}
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary me-1"
                                    data-bs-dismiss="modal"
                                    onClick={cancelEditOrAdd}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {`${editId ? "Edit" : "Add"} Device`}

                                </button>
                            </div>

                        </form>

                    </div>
                </div>
            </div>
            <div className="modal fade" id="add-quantity" tabIndex={-1} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content shadow-lg rounded-4">
                        <form onSubmit={handleAddQuantity}>
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title">Mannage Quantity</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                    onClick={(e) => handleCancelAddQuantity(e)}
                                ></button>
                            </div>
                            <div className="modal-body text-center pt-0">
                                <div className="my-3 fw-bold">Available devices: {actualQuantity}</div>
                                <p className="text-muted mb-3">
                                    Enter the quantity for this device
                                </p>

                                <input
                                    type="number"
                                    className="form-control form-control-lg text-center mb-4"
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                   placeholder="Use negative value to reduce quantity"
                                    required
                                />

                                <div className="d-flex justify-content-center gap-3">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary px-4"
                                        data-bs-dismiss="modal"
                                        onClick={(e) => handleCancelAddQuantity(e)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary px-4">
                                        Manage Quantity
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </>
    );
};

export default DeviceModal;
