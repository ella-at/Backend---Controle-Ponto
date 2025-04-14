import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WebcamCapture from '../components/WebcamCapture';
import SignatureCanvas from '../components/SignatureCanvas';

function RegistroPonto() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioId, setFuncionarioId] = useState('');
  const [tipo, setTipo] = useState('entrada');
  const [fotoBase64, setFotoBase64] = useState('');
  const [assinaturaBase64, setAssinaturaBase64] = useState('');
  const [mensagem, setMensagem] = useState('');

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios.get(`${API_URL}/funcionarios`)
      .then(res => setFuncionarios(res.data))
      .catch(() => setMensagem('Erro ao buscar funcionários'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!funcionarioId || !fotoBase64 || !assinaturaBase64) {
      setMensagem('Preencha todos os campos, tire a foto e assine.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('funcionario_id', funcionarioId);
      formData.append('tipo', tipo);
      formData.append('foto', dataURLtoFile(fotoBase64, 'foto.jpg'));
      formData.append('assinatura', dataURLtoFile(assinaturaBase64, 'assinatura.png'));

      await axios.post(`${API_URL}/pontos`, formData);
      setMensagem('Registro realizado com sucesso!');
    } catch (err) {
      console.error(err);
      setMensagem('Erro ao registrar ponto.');
    }
  };

  const dataURLtoFile = (dataUrl, filename) => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro de Ponto</h2>

      <label>Funcionário:</label>
      <select value={funcionarioId} onChange={e => setFuncionarioId(e.target.value)}>
        <option value="">Selecione</option>
        {funcionarios.map(f => (
          <option key={f.id} value={f.id}>{f.nome}</option>
        ))}
      </select>

      <br /><br />

      <label>Tipo de Ponto:</label>
      <select value={tipo} onChange={e => setTipo(e.target.value)}>
        <option value="entrada">Entrada</option>
        <option value="saida">Saída</option>
      </select>

      <br /><br />

      <WebcamCapture onCapture={setFotoBase64} />
      <SignatureCanvas onSignature={setAssinaturaBase64} />

      <button type="submit">Registrar Ponto</button>

      {mensagem && (
        <p style={{ marginTop: '1rem', color: mensagem.includes('sucesso') ? 'green' : 'red' }}>
          {mensagem}
        </p>
      )}
    </form>
  );
}

export default RegistroPonto;
