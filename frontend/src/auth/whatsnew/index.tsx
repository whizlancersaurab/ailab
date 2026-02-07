import { useState } from "react";

const WhatsNew = () => {
  const [selectedTopic, setSelectedTopic] = useState<null | {
    id: number;
    title: string;
    description: string;
  }>(null);

  const aiTopics = [
    {
      id: 1,
      title: "AI-Powered Automation",
      description:
        "AI and robotics are transforming industries through smart automation and innovation.",
    },
    {
      id: 2,
      title: "Robotics in Healthcare",
      description:
        "Robotics and AI help doctors in surgery, diagnosis, and patient care.",
    },
    {
      id: 3,
      title: "AI in Education",
      description:
        "AI personalizes learning, helps teachers, and improves student outcomes.",
    },
    {
      id: 4,
      title: "Robots in Space Missions",
      description:
        "Robots explore space, collect data, and assist astronauts in missions.",
    },
    {
      id: 5,
      title: "Smart Homes with AI",
      description:
        "AI-powered smart homes improve comfort, security, and energy efficiency.",
    },
  ];

  // Text truncate helper
  const truncateText = (text: string, limit = 60) =>
    text.length > limit ? text.slice(0, limit) + "..." : text;

  return (
    <div className="col-lg-6 d-none d-lg-block">
      <div className="login-background vh-100 d-flex align-items-center p-4">
        <div className="authen-overlay-item w-100">
          <h4 className="text-white mb-3">
            What's New on AI and Robotics !!!
          </h4>

          {/* Topic Cards */}
          {aiTopics.map((item) => (
            <div
              key={item.id}
              className="card p-3 mb-3"
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedTopic(item)}
            >
              <h6>{item.title}</h6>
              <p className="mb-0">{truncateText(item.description)}</p>
            </div>
          ))}

          {/* Modal */}
          {selectedTopic && (
            <div
              className="modal fade show"
              style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
              onClick={() => setSelectedTopic(null)}
            >
              <div
                className="modal-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">{selectedTopic.title}</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setSelectedTopic(null)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <p>{selectedTopic.description}</p>
                  </div>
                  <div className="modal-footer">
                    <button
                      className="btn btn-secondary"
                      onClick={() => setSelectedTopic(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* End Modal */}
        </div>
      </div>
    </div>
  );
};

export default WhatsNew;
