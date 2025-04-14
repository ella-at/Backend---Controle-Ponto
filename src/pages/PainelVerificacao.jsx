import React, { useEffect, useState } from 'react';
import axios from 'axios';

function PainelVerificacao() {
  const [entradas, setEntradas] = useState([]);
  const [faltantes, setFaltantes] = useState([]);
  const [erro, setErro] = useState('');
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    buscarDados();
  }, []);

  const buscarDados = async () => {
    try {
      const resEntradas = await axios.get(`${API_URL}/pontos/hoje`);
      const resFaltantes = await axios.get(`${API_URL}/pontos/faltantes`);
      setEntradas(resEntradas.data);
      setFaltantes(resFaltantes.data);
    } catch (err) {
      console.error(err);
      setErro('Erro ao carregar dados.');
    }
  };

  return (
    <div>
      <h2>Entradas de Hoje</h2>
      {entradas.length === 0 ? (
        <p>Nenhuma entrada registrada ainda.</p>
      ) : (
        <ul>
          {entradas.map(p => (
            <li key={p.id} style={{ marginBottom: '1rem' }}>
              <strong>{p.Funcionario?.nome}</strong> - {new Date(p.data_hora).toLocaleTimeString()}
              <br />
              {p.foto && (
                <img src={`http://localhost:3000/${p.foto}`} alt="foto" width="100" />
              )}
              {p.assinatura && (
                <img src={`http://localhost:3000/${p.assinatura}`} alt="assinatura" width="100" />
              )}
            </li>
          ))}
        </ul>
      )}

      <h2>Faltando registrar entrada</h2>
      {faltantes.length === 0 ? (
        <p>Todos já registraram entrada 🎉</p>
      ) : (
        <ul>
          {faltantes.map(f => (
            <li key={f.id}>{f.nome}</li>
          ))}
        </ul>
      )}

      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}

export default PainelVerificacao;
