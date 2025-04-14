import React, { useState } from 'react';
import RegistroPonto from './pages/RegistroPonto';
import PainelVerificacao from './pages/PainelVerificacao';

function App() {
  const [tela, setTela] = useState('registro');

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Controle de Ponto</h1>
      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => setTela('registro')}>Registrar Ponto</button>
        <button onClick={() => setTela('painel')}>Painel de Verificação</button>
      </div>

      {tela === 'registro' && <RegistroPonto />}
      {tela === 'painel' && <PainelVerificacao />}
    </div>
  );
}

export default App;
