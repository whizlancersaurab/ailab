import { Link } from "react-router-dom";

const TooltipOption = () => {
  return (
    <>
      <div className="dropdown me-2 mb-2">
        <Link
          to="#"
          className="dropdown-toggle btn btn-light fw-medium d-inline-flex align-items-center"
          data-bs-toggle="dropdown"
        >
          <i className="ti ti-file-export me-2" />
          Export
        </Link>
        <ul className="dropdown-menu  dropdown-menu-end p-3">
          <li >
            <Link to="#" className="dropdown-item rounded-1">
              <i className="ti ti-file-type-pdf me-1" />
              Export as PDF
            </Link>
          </li>
          <li >
            <Link to="#" className="dropdown-item rounded-1">
              <i className="ti ti-file-type-xls me-1" />
              Export as Excel{" "}
            </Link>
          </li>
        </ul>
      </div>
    </>
  );
};

export default TooltipOption;
