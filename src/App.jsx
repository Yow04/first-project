import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [input, setInput] = useState('');
  const [baskets, setBaskets] = useState([]); // Changed from ['myBasket'] to empty array
  const [newBasketName, setNewBasketName] = useState('');
  const [selectedBasket, setSelectedBasket] = useState(''); // Changed initial value to empty string
  const [renameInput, setRenameInput] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const pantryId = import.meta.env.VITE_PANTRY_ID;
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async (basket) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/${pantryId}/basket/${basket}`);
      setData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setData({ message: 'Basket kosong atau belum ada isi' });
      } else {
        console.error('Error fetching data:', error);
        setData({ message: 'Gagal memuat data basket.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createBasket = async () => {
    if (!newBasketName || baskets.includes(newBasketName)) {
      alert('Masukkan nama basket baru yang unik!');
      return;
    }
    try {
      await axios.post(`${apiUrl}/${pantryId}/basket/${newBasketName}`, {
        message: 'Basket baru dibuat!',
      });
      const updatedBaskets = [...baskets, newBasketName];
      setBaskets(updatedBaskets);
      setSelectedBasket(newBasketName); // Automatically select the new basket
      setNewBasketName('');
    } catch (error) {
      console.error('Error creating basket:', error);
    }
  };

  const saveData = async () => {
    try {
      let parsedInput;
      try {
        parsedInput = JSON.parse(input);
      } catch {
        parsedInput = { message: input };
      }
      await axios.post(`${apiUrl}/${pantryId}/basket/${selectedBasket}`, parsedInput);
      await fetchData(selectedBasket);
      setInput('');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const deleteData = async () => {
    try {
      await axios.delete(`${apiUrl}/${pantryId}/basket/${selectedBasket}`);
      const updatedBaskets = baskets.filter((b) => b !== selectedBasket);
      setBaskets(updatedBaskets);
      setData(null);
      setSelectedBasket(updatedBaskets[0] || ''); // Select first basket or empty string if none
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  const renameBasket = async () => {
    if (!renameInput || baskets.includes(renameInput)) {
      alert('Masukkan nama baru yang unik!');
      return;
    }
    try {
      const currentData = data || (await axios.get(`${apiUrl}/${pantryId}/basket/${selectedBasket}`)).data;
      await axios.post(`${apiUrl}/${pantryId}/basket/${renameInput}`, currentData);
      await axios.delete(`${apiUrl}/${pantryId}/basket/${selectedBasket}`);
      const updatedBaskets = baskets.map((basket) =>
        basket === selectedBasket ? renameInput : basket
      );
      setBaskets(updatedBaskets);
      setSelectedBasket(renameInput);
      setRenameInput('');
      setIsRenaming(false);
      setData(currentData);
    } catch (error) {
      console.error('Error renaming basket:', error);
      alert('Gagal merename basket. Silakan coba lagi.');
    }
  };

  const handleBasketSelect = (basket) => {
    setSelectedBasket(basket);
    setIsRenaming(false);
  };

  useEffect(() => {
    if (selectedBasket) {
      fetchData(selectedBasket);
    }
  }, [selectedBasket]);

  const renderData = (data) => {
    if (isLoading) return <p>Memuat data...</p>;
    if (!data) return <p>Belum ada data atau basket belum dipilih.</p>;
    return (
      <pre className="json-output">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Pantry: {pantryId.slice(0, 8)}...</h3>
        <h4>Baskets</h4>
        <div className="basket-list">
          {baskets.length > 0 ? (
            baskets.map((basket) => (
              <button
                key={basket}
                className={basket === selectedBasket ? 'active' : ''}
                onClick={() => handleBasketSelect(basket)}
              >
                {basket}
              </button>
            ))
          ) : (
            <p>Belum ada basket. Buat satu!</p>
          )}
        </div>
        <h4>Create New Basket</h4>
        <div className="basket-create-section">
          <input
            type="text"
            value={newBasketName}
            onChange={(e) => setNewBasketName(e.target.value)}
            placeholder="Nama basket baru"
          />
          <button onClick={createBasket}>Create</button>
        </div>
        <h4>View Errors</h4>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="header">
          <h2>{selectedBasket || 'Buat Basket'}</h2>
          {selectedBasket && (
            <button
              className="rename-toggle"
              onClick={() => setIsRenaming(!isRenaming)}
            >
              {isRenaming ? 'Cancel' : 'Rename'}
            </button>
          )}
        </div>

        {isRenaming && selectedBasket && (
          <div className="rename-section">
            <input
              type="text"
              value={renameInput}
              onChange={(e) => setRenameInput(e.target.value)}
              placeholder="Masukkan nama baru"
            />
            <button onClick={renameBasket}>Save Rename</button>
          </div>
        )}

        <div className="data-section">{renderData(data)}</div>

        {selectedBasket && !isRenaming && (
          <div className="input-section">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Masukkan pesan atau JSON"
            />
            <button className="save-button" onClick={saveData}>
              Save
            </button>
            <button className="delete-button" onClick={deleteData}>
              Delete Basket
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;