import React, { useRef } from 'react';

function SignatureCanvas({ onSignature }) {
  const canvasRef = useRef(null);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    onSignature(canvas.toDataURL('image/png'));
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        style={{ border: '1px solid black' }}
        onMouseUp={handleMouseUp}
        onTouchEnd={handleMouseUp}
        onMouseDown={e => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.beginPath();
          ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }}
        onMouseMove={e => {
          if (e.buttons !== 1) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          ctx.stroke();
        }}
      />
      <br />
      <button onClick={clearCanvas}>Limpar Assinatura</button>
    </div>
  );
}

export default SignatureCanvas;
