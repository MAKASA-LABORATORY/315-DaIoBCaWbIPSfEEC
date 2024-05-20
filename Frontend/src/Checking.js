import React from "react";
import cam from "./images/camera.png";

function Checking() {
  const runOMR = async () => {
    try {
      const response = await fetch("/run_omr");
      const data = await response.text();
      console.log(data); // Log the output of OMR_main.py
      // Display the output as needed
    } catch (error) {
      console.error("Error running OMR_main.py:", error);
    }
  };

  return (
    <div>
      <img
        src={cam}
        alt="camera-icon"
        style={{
          width: "200px",
          height: "200px",
          display: "block",
          margin: "auto",
          cursor: "pointer",
        }}
        onClick={runOMR}
      />
      <h3 style={{ textAlign: "center", cursor: "pointer" }}>
        Click to run OMR
      </h3>
    </div>
  );
}

export default Checking;
