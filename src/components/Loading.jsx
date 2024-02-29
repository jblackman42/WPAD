import React from "react";

const Loading = () => {
  return (
    <div id="loadingScreen">
        <div className="loader"></div>
        <div id="loading-bar">
          <div id="progress"></div>
        </div>
    </div>
  )
}

export default Loading;