import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import { resetPassword } from "../../service/api";
import { toast } from "react-toastify";
import WhatsNew from "../whatsnew";
// import { Toast } from "react-bootstrap";

type PasswordField = "otp" | "newPassword" | "confirmPassword";

const ResetPassword = () => {
  const routes = all_routes;
  const [passwordVisibility, setPasswordVisibility] = useState({
    otp: false,
    newPassword: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: PasswordField) => {
    setPasswordVisibility((prevState) => ({
      ...prevState,
      [field]: !prevState[field],
    }));
  };

  const navigate = useNavigate();
  const location = useLocation()

  // ✅ Form state
  const [formData, setFormData] = useState({
    email: "sa@gmail.com",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({ ...prev, email: location.state.email }));
    }
  }, [location.state]);

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log(formData)
    try {
      const { data } = await resetPassword(formData)
      if (data.success) {
        toast.success(data.message)
        navigate(routes.resetPasswordSuccess);
      } else {
        alert(data.message || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.response.data.message)
    }
  };

  return (
    <div className="container-fuild">
      <div className="login-wrapper w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
        <div className="row">
          {/* ✅ Left side panel (unchanged) */}
        <WhatsNew/>

          {/* ✅ Right side form */}
          <div className="col-lg-6 col-md-12 col-sm-12">
            <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
              <div className="col-md-8 mx-auto p-4">
                <form onSubmit={handleSubmit}>
                  <div>
                    <div className=" mx-auto mb-3 text-center">
                       <img
                        src="assets/img/logo2.png"
                        className="img-fluid"
                        alt="Logo"
                        style={{width:'100%' , maxWidth:'220px'}}
                      />
                    </div>
                    <div className="card">
                      <div className="card-body p-4">
                        <div className=" mb-4">
                          <h2 className="mb-2">Reset Password?</h2>
                          <p className="mb-0">
                            Enter OTP, New Password & Confirm Password
                          </p>
                        </div>

                        {/* ✅ OTP */}
                        <div className="mb-3">
                          <label className="form-label">Enter Otp</label>
                          <div className="pass-group">
                            <input
                              type="text"
                              name="otp"
                              value={formData.otp}
                              onChange={handleChange}
                              className="pass-input form-control"
                              required
                            />
                          </div>
                        </div>

                        {/* ✅ New Password */}
                        <div className="mb-3">
                          <label className="form-label">New Password</label>
                          <div className="pass-group">
                            <input
                              type={
                                passwordVisibility.newPassword
                                  ? "text"
                                  : "password"
                              }
                              name="newPassword"
                              value={formData.newPassword}
                              onChange={handleChange}
                              className="pass-input form-control"
                              required
                            />
                            <span
                              className={`ti toggle-passwords ${passwordVisibility.newPassword
                                  ? "ti-eye"
                                  : "ti-eye-off"
                                }`}
                              onClick={() =>
                                togglePasswordVisibility("newPassword")
                              }
                            ></span>
                          </div>
                        </div>

                        {/* ✅ Confirm Password */}
                        <div className="mb-3">
                          <label className="form-label ">
                            New Confirm Password
                          </label>
                          <div className="pass-group">
                            <input
                              type={
                                passwordVisibility.confirmPassword
                                  ? "text"
                                  : "password"
                              }
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleChange}
                              className="pass-input form-control"
                              required
                            />
                            <span
                              className={`ti toggle-passwords ${passwordVisibility.confirmPassword
                                  ? "ti-eye"
                                  : "ti-eye-off"
                                }`}
                              onClick={() =>
                                togglePasswordVisibility("confirmPassword")
                              }
                            ></span>
                          </div>
                        </div>

                        <div className="mb-3">
                          <button
                            type="submit"
                            className="btn btn-primary w-100"
                          >
                            Change Password
                          </button>
                        </div>
                        <div className="text-center">
                          <h6 className="fw-normal text-dark mb-0">
                            Return to
                            <Link to={routes.login} className="hover-a ">
                              {" "}
                              Login
                            </Link>
                          </h6>
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 text-center">
                      <p className="mb-0 ">Copyright © 2026 - BOTIXBO</p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
