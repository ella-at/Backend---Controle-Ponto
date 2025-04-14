import React, { useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';

export default function SignaturePad({ onSignature }) {
  const sigRef = useRef();

  const clear = () => sigRef.current.clear();

  const save = () => {
    if (!sigRef.current.isEmpty()) {
      const dataURL = sigRef.current.toDataURL();
      onSignature(dataURL);
    }
  };

  useEffect(() => {
    window.addEventListener('resize', () => {
      const canvas = sigRef.current.getCanvas();
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
  }, []);

  return (
    <div style={{ border: '1px solid #ccc', marginTop: '1rem' }}>
      <SignatureCanvas
        penColor="black"
        canvasProps={{
          width: 300,
          height: 150,
          className: 'sigCanvas',
          style: { width: '100%', height: '150px' },
        }}
        ref={sigRef}
      />
      <div style={{ marginTop: 10 }}>
        <button onClick={clear}>🧽 Limpar</button>
        <button onClick={save} style={{ marginLeft: 10 }}>💾 Salvar</button>
      </div>
    </div>
  );
}
