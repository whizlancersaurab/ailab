
import { Link } from "react-router-dom";
import { all_routes } from "../../router/all_routes";
import ImageWithBasePath from "../../core/common/imageWithBasePath";
import WhatsNew from "../whatsnew";

const ResetPasswordSuccess = () => {
  const routes = all_routes;
  return (
    <>
      {" "}
      <div className="container-fluid">
        <div className="login-wrapper w-100 overflow-hidden position-relative flex-wrap d-block vh-100">
          <div className="row">
            <WhatsNew/>
            <div className="col-lg-6 col-md-12 col-sm-12">
              <div className="row justify-content-center align-items-center vh-100 overflow-auto flex-wrap ">
                <div className="col-md-8 mx-auto p-4">
                  <div className=" mx-auto mb-5 text-center">
                    <ImageWithBasePath
                      src="assets/img/authentication/authentication-logo.svg"
                      className="img-fluid"
                      alt="Logo"
                    />
                  </div>
                  <div className="card">
                    <div className="card-body text-center">
                      <span className="avatar avatar-lg rounded-circle bg-success mb-3">
                        <i className="ti ti-check fs-24" />
                      </span>
                      <h3 className="mb-2">Success</h3>
                      <p>Your Password Reset Successfully</p>
                      <Link to={routes.login} className="btn btn-primary w-100">
                        Back to Login
                      </Link>
                    </div>
                  </div>
                  <div className="mt-5 text-center">
                    <p className="mb-0 ">Copyright © 2024 - Preskool</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordSuccess;
