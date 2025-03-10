import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [input, setInput] = useState('');
  const [basketName, setBasketName] = useState('myBasket');

  const pantryId = process.env.REACT_APP_PANTRY_ID;
  const apiUrl = process.env.REACT_APP_API_URL;

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}/${pantryId}/basket/${basketName}`
      );
      setData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        try {
          await axios.post(
            `${apiUrl}/${pantryId}/basket/${basketName}`,
            { message: 'Basket baru dibuat!' }
          );
          setData({ message: 'Basket baru dibuat!' });
        } catch (createError) {
          console.error('Error creating basket:', createError);
        }
      } else {
        console.error('Error fetching data:', error);
      }
    }
  };

  const saveData = async () => {
    try {
      await axios.post(
        `${apiUrl}/${pantryId}/basket/${basketName}`,
        { message: input }
      );
      fetchData();
      setInput('');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const deleteData = async () => {
    try {
      await axios.delete(
        `${apiUrl}/${pantryId}/basket/${basketName}`
      );
      setData(null);
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const handleBasketChange = (newBasketName) => {
    setBasketName(newBasketName);
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [basketName]);

  return (
    <div className="App">
      <h1>Pantry API dengan React</h1>

      {/* Input untuk mengubah basketName */}
      <div className="basket-name-section">
        <h3>Nama Basket:</h3>
        <input
          type="text"
          value={basketName}
          onChange={(e) => setBasketName(e.target.value)}
          placeholder="Masukkan nama basket"
        />
        <button onClick={() => handleBasketChange(basketName)}>
          Ganti Basket
        </button>
      </div>

      {/* Tampilkan data dari pantry */}
      <div className="data-section">
        <h3>Data Saat Ini di {basketName}:</h3>
        {data ? (
          <pre>{JSON.stringify(data, null, 2)}</pre>
        ) : (
          <p>Belum ada data.</p>
        )}
      </div>

      {/* Form untuk input data baru */}
      <div className="input-section">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Masukkan pesan"
        />
        <button onClick={saveData}>Simpan</button>
        <button onClick={deleteData}>Hapus Data</button>
      </div>
    </div>
  );
}

export default App;