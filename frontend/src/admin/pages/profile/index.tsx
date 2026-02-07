
import { Link } from "react-router-dom";
import { all_routes } from "../../../router/all_routes";
import { updateProfile, userInfo } from "../../../service/api";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CircleImage from "../../../auth/register/CircleImage";
import { handleModalPopUp } from "../../../handlePopUpmodal";
import { Spinner } from "../../../spinner";


interface RegisterForm {
  schoolName: string;
  firstName: string;
  lastName: string;
  email: string;

}

interface Errors {
  schoolName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}


const Profile = () => {
  const route = all_routes;
  const [form, setForm] = useState<RegisterForm>({
    schoolName: "",
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState<boolean>(false)
  const [loading2, setLoading2] = useState<boolean>(false)

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading2(true)

      const { data } = await userInfo()
      if (data.success) {

        setForm({
          schoolName: data.data.name,
          firstName: data.data.firstname,
          lastName: data.data.lastname,
          email: data.data.email
        })
        setProfilePreview(data.data.profileImage)
        setLogoPreview(data.data.schoolLogo)
      }


    } catch (error) {
      console.log(error)
    } finally {
      setLoading2(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])


  // update


  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };



  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    localStorage.setItem("menuOpened", "Register");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetFormData = () => {
    setForm({
      schoolName: "",
      firstName: "",
      lastName: "",
      email: "",

    })
    setProfileFile(null)
    setProfilePreview(null)
    setLogoFile(null)
    setLogoPreview(null)
    // handleModalPopUp('edit_personal_information')
  }

  // ✅ Validation
  const validateForm = () => {
    const err: Errors = {};
    if (!form.schoolName.trim()) err.schoolName = "School Name is required";
    else if (form.schoolName.length < 5) err.schoolName = "School Name shuold be at least 5 chracters !"

    if (!form.firstName.trim()) err.firstName = "First name is required";
    else if (form.firstName.length < 3) err.firstName = "Frist name shuold be at least 3 chracters !"
    // if (!form.lastName.trim()) err.lastName = "Last name is required";

    if (!form.email.trim()) {
      err.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      err.email = "Invalid email address";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ✅ Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!validateForm()) return;
    setLoading(true)
    const formData = new FormData();

    // text fields
    formData.append("firstName", form.firstName);
    formData.append("lastName", form.lastName);
    formData.append("email", form.email);
    formData.append("schoolName", form.schoolName);

    // image files (IMPORTANT)
    if (profileFile) {
      formData.append("profileImage", profileFile);
    }

    if (logoFile) {
      formData.append("schoolLogo", logoFile);
    }

    try {
      const { data } = await updateProfile(formData);

      if (data.success) {
        toast.success(data.message);
        resetFormData()
        fetchUser()
        handleModalPopUp('edit_personal_information')

      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false)
    }
  };



  return (
    <div>
      <>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content">
            <div className="d-md-flex d-block align-items-center justify-content-between border-bottom pb-3">
              <div className="my-auto mb-2">
                <h3 className="page-title mb-1">Profile</h3>
                <nav>
                  <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item">
                      <Link to={route.adminDashboard}>Dashboard</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="#">Settings</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Profile
                    </li>
                  </ol>
                </nav>
              </div>
              <div className="d-flex my-xl-auto right-content align-items-center flex-wrap">
                <div className="pe-1 mb-2">

                </div>
              </div>
            </div>
            {
              loading2 ? <Spinner /> : (
                <div className="d-md-flex d-block mt-3">
                  <div className="settings-right-sidebar me-md-3 border-0">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="mb-0">Your Images</h5>
                      </div>

                      <div className="card-body">
                        <div className="row text-center g-3">

                          {/* Profile Image */}
                          <div className="col-6">
                            <img
                              src={profilePreview ?? "assets/img/user.jpg"}
                              alt="Profile"
                              className="img-fluid rounded-3"
                              style={{
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                border: "2px dashed #ced4da",
                                objectFit: "cover",
                                cursor:'pointer'
                              }}
                            />
                            <p className="mt-2 fw-semibold">Profile Image</p>
                          </div>

                          {/* Logo Image */}
                          <div className="col-6">
                            <img
                              src={logoPreview ?? "assets/img/school.webp"}
                              alt="Logo"
                              className="img-fluid rounded-3"
                              style={{
                                width: 120,
                                height: 120,
                                borderRadius: "50%",
                                border: "2px dashed #ced4da",
                                objectFit: "cover",
                                cursor:'pointer'
                              }}
                            />
                            <p className="mt-2 fw-semibold">School Logo</p>
                          </div>

                        </div>
                      </div>

                    </div>

                  </div>
                  <div className="flex-fill ps-0 border-0">
                    <form>
                      <div className="d-md-flex">
                        <div className="flex-fill">
                          <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                              <h5>Personal Information</h5>
                              <Link
                                to="#"
                                className="btn btn-primary btn-sm"
                                data-bs-toggle="modal"
                                data-bs-target="#edit_personal_information"
                              >
                                <i className="ti ti-edit me-2" />
                                Edit
                              </Link>
                            </div>
                            <div className="card-body pb-0">
                              <div className="d-block d-xl-flex">
                                <div className="mb-3 flex-fill me-xl-3 me-0">
                                  <label className="form-label">First Name</label>
                                  <input
                                    type="text"
                                    className="form-control"

                                    value={form.firstName}
                                  />
                                </div>
                                <div className="mb-3 flex-fill">
                                  <label className="form-label">Last Name</label>
                                  <input
                                    type="text"
                                    className="form-control"

                                    value={form.lastName}
                                  />
                                </div>
                              </div>
                              <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                <input
                                  type="email"
                                  className="form-control"

                                  value={form.email}
                                />
                              </div>
                              <div className="d-block d-xl-flex">
                                <div className="mb-3 flex-fill me-xl-3 me-0">
                                  <label className="form-label">School Name</label>
                                  <input
                                    type="text"
                                    className="form-control"

                                    value={form.schoolName}
                                  />
                                </div>

                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </form>
                  </div>
                </div>)
            }

          </div>
        </div>
        {/* /Page Wrapper */}
        {/* Edit Profile */}
        <div className="modal fade" id="edit_personal_information">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h4 className="modal-title">Edit Personal Information</h4>
                <button
                  type="button"
                  className="btn-close custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                // onClick={() => resetFormData()}
                >
                  <i className="ti ti-x" />
                </button>
              </div>
              <div className="p-3">
                <div className="row justify-content-center align-items-center ">
                  <div className="">
                    <form onSubmit={handleSubmit}>

                      <div className="card">
                        <div className="card-body">


                          {/* Profile & School Images */}
                          <div className="row mb-4">
                            <div className="col-6">
                              <CircleImage
                                preview={profilePreview}
                                label="User Image"
                                onChange={handleProfileChange}
                              />
                            </div>

                            <div className="col-6">
                              <CircleImage
                                preview={logoPreview}
                                label="School Logo"
                                onChange={handleLogoChange}
                              />
                            </div>
                          </div>


                          {/* First Name */}
                          <div className="mb-3">
                            <label className="form-label">School Name</label>
                            <input
                              name="schoolName"
                              value={form.schoolName}
                              onChange={handleChange}
                              className="form-control mb-2"
                              placeholder="School Name"
                            />
                            {errors.schoolName && (
                              <p className="text-danger">{errors.schoolName}</p>
                            )}
                          </div>
                          <div className="mb-3">
                            <label className="form-label">FirstName</label>
                            <input
                              name="firstName"
                              value={form.firstName}
                              onChange={handleChange}
                              className="form-control mb-2"
                              placeholder="First Name"
                            />
                            {errors.firstName && (
                              <p className="text-danger">{errors.firstName}</p>
                            )}
                          </div>

                          {/* Last Name */}
                          <div className="mb-3">
                            <label className="form-label">LastName</label>
                            <input
                              name="lastName"
                              value={form.lastName}
                              onChange={handleChange}
                              className="form-control mb-2"
                              placeholder="Last Name"
                            />
                          </div>
                       

                          {/* Email */}
                          <div className="mb-3">
                            <label className="form-label">Email</label>
                            <input
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              className="form-control mb-2"
                              placeholder="Email"
                            />
                            {errors.email && (
                              <p className="text-danger">{errors.email}</p>
                            )}
                          </div>


                          <div className="d-flex justify-content-end gap-2 mt-4">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              data-bs-dismiss="modal"
                              aria-label="Close"

                            >
                              Back
                            </button>

                            <button
                              type="submit"
                              disabled={loading}
                              className="btn btn-primary px-4"
                            >
                              {loading ? 'Updating...' : 'Update'}
                            </button>
                          </div>
                        </div>
                      </div>

                    </form>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
        {/* /Edit Profile */}

        {/* /Change Password */}
      </>
    </div>
  );
};

export default Profile;
