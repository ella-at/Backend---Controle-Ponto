import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: 300,
  height: 300,
  facingMode: "user"
};

function WebcamCapture({ onCapture }) {
  const webcamRef = useRef(null);
  const [screenshot, setScreenshot] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setScreenshot(imageSrc);
    onCapture(imageSrc);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      {!screenshot ? (
        <>
          <Webcam
            audio={false}
            height={300}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={300}
            videoConstraints={videoConstraints}
          />
          <br />
          <button onClick={capture}>Capturar Foto</button>
        </>
      ) : (
        <>
          <img src={screenshot} alt="captura" width="300" />
          <br />
          <button onClick={() => setScreenshot(null)}>Refazer</button>
        </>
      )}
    </div>
  );
}

export default WebcamCapture;
