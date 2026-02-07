import React, { useEffect, useState } from "react";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import { useNavigate } from "react-router-dom";
// import { all_routes } from "../../router/all_routes";
// import { FaFacebook, FaGoogle } from "react-icons/fa";
import { toast } from "react-toastify";
import { register } from "../../service/api";
import WhatsNew from "../whatsnew";
import { useSelector } from "react-redux";
import type { RootState } from "../../core/data/redux/store";
import CircleImage from "./CircleImage";

interface RegisterForm {
  schoolName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface Errors {
  schoolName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const Register = () => {
  // const routes = all_routes;
  const navigate = useNavigate();

  const [isPasswordVisible, setPasswordVisible] = useState(false);
  const [isConfirmVisible, setConfirmVisible] = useState(false);

  const [form, setForm] = useState<RegisterForm>({
    schoolName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading ,setLoading] = useState<boolean>(false)
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
      password: "",
      confirmPassword: "",
    })
    setProfileFile(null)
    setProfileFile(null)
    setLogoFile(null)
    setLogoPreview(null)
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

    if (!form.password) {
      err.password = "Password is required";
    } else if (form.password.length < 8) {
      err.password = "Password must be at least 8 characters";
    }

    if (!form.confirmPassword) {
      err.confirmPassword = "Confirm password is required";
    } else if (form.password !== form.confirmPassword) {
      err.confirmPassword = "Passwords do not match";
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
    formData.append("password", form.password);
    formData.append("schoolName", form.schoolName);

    // image files (IMPORTANT)
    if (profileFile) {
      formData.append("profileImage", profileFile);
    }

    if (logoFile) {
      formData.append("schoolLogo", logoFile);
    }

    try {
      const { data } = await register(formData); // <-- FormData send

      if (data.success) {
        toast.success(data.message);
        resetFormData()
        navigate(-1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed");
    }finally{
      setLoading(false)
    }
  };


  const { role } = useSelector((state: RootState) => state.authSlice)


  return (
    <div className="container-fuild">
      <div className="w-100 overflow-hidden vh-100">
        <div className="row">

          {/* LEFT SIDE */}
          <WhatsNew />

          {/* RIGHT SIDE */}
          <div className="col-lg-6 col-md-12">
            <div className="row justify-content-center align-items-center vh-100">
              <div className="col-md-8 p-4">
                <form onSubmit={handleSubmit}>
                  <div className="text-center mb-4">
                    <ImageWithBasePath
                      src="assets/img/authentication/authentication-logo.svg"
                      alt="Logo"
                    />
                  </div>

                  <div className="card">
                    <div className="card-body">
                      <h2>Register</h2>
                      <p>Please enter details to register a new school</p>

                      {/* {profile and school image} */}

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
                      {/* {errors.lastName && (
                        <p className="text-danger">{errors.lastName}</p>
                      )} */}

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

                      {/* Password */}
                      <div className="pass-group mb-2">
                        <label className="form-label">Password</label>
                        <input
                          type={isPasswordVisible ? "text" : "password"}
                          name="password"
                          value={form.password}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Password"
                        />
                        <span
                          className="toggle-password mt-2"
                          onClick={() =>
                            setPasswordVisible(!isPasswordVisible)
                          }
                        >
                          <i
                            className={`ti ${isPasswordVisible ? "ti-eye" : "ti-eye-off"
                              }`}
                          />
                        </span>
                      </div>
                      {errors.password && (
                        <p className="text-danger">{errors.password}</p>
                      )}

                      {/* Confirm Password */}
                      <div className="pass-group mb-1 ">
                        <label className="form-label">Confirm Password</label>
                        <input
                          type={isConfirmVisible ? "text" : "password"}
                          name="confirmPassword"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          className="form-control"
                          placeholder="Confirm Password"
                        />
                        <span
                          className="toggle-password mt-2"
                          onClick={() =>
                            setConfirmVisible(!isConfirmVisible)
                          }
                        >
                          <i
                            className={`ti ${isConfirmVisible ? "ti-eye" : "ti-eye-off"
                              }`}
                          />
                        </span>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-danger">
                          {errors.confirmPassword}
                        </p>
                      )}

                      <div className="d-flex align-items-center justify-content-around">
                        <button
                          type="button"
                          onClick={() => {
                             resetFormData()
                             navigate(-1)}}
                          className="btn btn-danger  mt-3"
                        >
                          Back
                        </button>
                        {
                          role === 'SUPER_ADMIN' ? (
                            <button
                              type="submit"
                              disabled={loading}
                              className="btn btn-primary  mt-3"
                            >
                              {loading?'Registering...':'Register'}
                            </button>) : (<></>)
                        }
                      </div>

                      {/* <p className="text-center mt-3">
                        Already have an account?{" "}
                        <Link to={routes.login}>Sign In</Link>
                      </p> */}
                    </div>
                  </div>

                  <p className="text-center mt-4">
                    Copyright © {new Date().getFullYear()} - Whizlancer
                  </p>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
