import React, { useRef, useEffect } from 'react';

function SignatureCanvas({ onSignature }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const startDrawing = (x, y) => {
      isDrawing.current = true;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (x, y) => {
      if (!isDrawing.current) return;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      if (!isDrawing.current) return;
      isDrawing.current = false;
      onSignature(canvas.toDataURL('image/png'));
    };

    // Mouse
    canvas.addEventListener('mousedown', (e) => startDrawing(e.offsetX, e.offsetY));
    canvas.addEventListener('mousemove', (e) => draw(e.offsetX, e.offsetY));
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch
    canvas.addEventListener('touchstart', (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      startDrawing(touch.clientX - rect.left, touch.clientY - rect.top);
    });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault(); // evita scroll durante a assinatura
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      draw(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: false });

    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.replaceWith(canvas.cloneNode(true)); // remove todos os listeners ao desmontar
    };
  }, [onSignature]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignature('');
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        style={{
          border: '1px solid #ccc',
          touchAction: 'none',
          background: '#fff'
        }}
      />
      <br />
      <button onClick={clearCanvas}>Limpar Assinatura</button>
    </div>
  );
}

export default SignatureCanvas;
