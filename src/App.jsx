import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [input, setInput] = useState('');
  const [baskets, setBaskets] = useState(['myBasket']);
  const [newBasketName, setNewBasketName] = useState('');
  const [selectedBasket, setSelectedBasket] = useState('myBasket');
  const [renameInput, setRenameInput] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  const pantryId = import.meta.env.VITE_PANTRY_ID;
  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchData = async (basket) => {
    try {
      const response = await axios.get(
        `${apiUrl}/${pantryId}/basket/${basket}`
      );
      setData(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setData({ message: 'Basket kosong atau belum ada isi' });
      } else {
        console.error('Error fetching data:', error);
        setData(null);
      }
    }
  };

  const createBasket = async () => {
    if (!newBasketName || baskets.includes(newBasketName)) {
      alert('Masukkan nama basket baru yang unik!');
      return;
    }
    try {
      await axios.post(
        `${apiUrl}/${pantryId}/basket/${newBasketName}`,
        { message: 'Basket baru dibuat!' }
      );
      setBaskets([...baskets, newBasketName]);
      setSelectedBasket(newBasketName);
      setNewBasketName('');
      await fetchData(newBasketName); // Ensure data is fetched immediately
    } catch (error) {
      console.error('Error creating basket:', error);
    }
  };

  const saveData = async () => {
    try {
      await axios.post(
        `${apiUrl}/${pantryId}/basket/${selectedBasket}`,
        { message: input }
      );
      await fetchData(selectedBasket); // Ensure data is refreshed
      setInput('');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const deleteData = async () => {
    try {
      await axios.delete(
        `${apiUrl}/${pantryId}/basket/${selectedBasket}`
      );
      const updatedBaskets = baskets.filter(b => b !== selectedBasket);
      setBaskets(updatedBaskets);
      setData(null);
      setSelectedBasket(updatedBaskets[0] || '');
      if (updatedBaskets.length > 0) {
        await fetchData(updatedBaskets[0]);
      }
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
      // Get current basket data
      const currentData = await axios.get(
        `${apiUrl}/${pantryId}/basket/${selectedBasket}`
      );

      // Create new basket with old data
      await axios.post(
        `${apiUrl}/${pantryId}/basket/${renameInput}`,
        currentData.data
      );

      // Delete old basket
      await axios.delete(
        `${apiUrl}/${pantryId}/basket/${selectedBasket}`
      );

      // Update state
      const updatedBaskets = baskets.map(basket =>
        basket === selectedBasket ? renameInput : basket
      );
      setBaskets(updatedBaskets);
      setSelectedBasket(renameInput);
      setRenameInput('');
      setIsRenaming(false);
      await fetchData(renameInput); // Ensure data is fetched after renaming
    } catch (error) {
      console.error('Error renaming basket:', error);
    }
  };

  const handleBasketSelect = (basket) => {
    setSelectedBasket(basket);
    setIsRenaming(false);
    fetchData(basket); // Fetch immediately on selection
  };

  useEffect(() => {
    if (selectedBasket) {
      fetchData(selectedBasket);
    }
  }, [selectedBasket]);

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h3>Pantry: {pantryId.slice(0, 8)}...</h3>
        
        <h4>Baskets</h4>
        <div className="basket-list">
          {baskets.map((basket) => (
            <button
              key={basket}
              className={basket === selectedBasket ? 'active' : ''}
              onClick={() => handleBasketSelect(basket)}
            >
              {basket}
            </button>
          ))}
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
          <h2>{selectedBasket || 'Pilih basket'}</h2>
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

        <div className="data-section">
          {data ? (
            <pre>{JSON.stringify(data, null, 2)}</pre>
          ) : (
            <p>Belum ada data atau basket belum dipilih.</p>
          )}
        </div>
        
        {selectedBasket && !isRenaming && (
          <div className="input-section">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Masukkan pesan"
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