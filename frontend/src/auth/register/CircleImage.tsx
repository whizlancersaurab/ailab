type CircleImageProps = {
  preview: string | null;
  label: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const CircleImage: React.FC<CircleImageProps> = ({
  preview,
  label,
  onChange,
}) => {
  return (
    <div className="text-center">
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          border: "2px dashed #ced4da",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          backgroundColor: "#f8f9fa",
          margin: "0 auto 10px",
          cursor: "pointer",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span className="text-muted">No Image</span>
        )}
      </div>

      <label className="btn btn-outline-primary btn-sm">
        {label}
        <input
          type="file"
          accept="image/*"
          hidden
          onChange={onChange}
        />
      </label>
    </div>
  );
};


export default CircleImage