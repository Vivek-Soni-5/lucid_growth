import React, { useState, useEffect } from 'react';
import './CSVReader.css'; // Import CSS file

function CSVReader() {
  const [csvData, setCsvData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editableRowIndex, setEditableRowIndex] = useState(null);
  const [editableRow, setEditableRow] = useState({});
  const [newRowData, setNewRowData] = useState({});

  useEffect(() => {
    // Filter CSV data based on search query
    const filtered = csvData.filter(row =>
      Object.values(row).some(value =>
        value.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [csvData, searchQuery]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('csvFile', file);

    try {
      const response = await fetch('https://lucidserver-qxccpmnsuq-el.a.run.app/uploads', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setCsvData(data.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEdit = (rowIndex) => {
    setEditableRowIndex(rowIndex);
    setEditableRow({ ...filteredData[rowIndex] });
  };

  const handleSave = () => {
    if (editableRowIndex !== null) {
      // Editing an existing row
      const updatedData = [...csvData];
      updatedData[editableRowIndex] = editableRow;
      setCsvData(updatedData);
      setEditableRowIndex(null);
      setEditableRow({});
    } else {
      // Adding a new row
      setCsvData([...csvData, newRowData]);
      setNewRowData({});
    }
  };

  const handleInputChange = (e, key) => {
    setEditableRow({ ...editableRow, [key]: e.target.value });
  };

  const handleNewRowChange = (e, key) => {
    const { value } = e.target;
    // Set the new value for the changed cell
    setNewRowData(prevRowData => ({
      ...prevRowData,
      [key]: value
    }));
    
  };
  

  const handleDelete = (rowIndex) => {
    const updatedData = csvData.filter((_, index) => index !== rowIndex);
    setCsvData(updatedData);
  };

  const handleExport = () => {
    // Convert updated CSV data to CSV file format
    const csvContent = csvData.map(row => Object.values(row).join(',')).join('\n');
    // Create a Blob object to save as CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    // Create a link element to download the CSV file
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'updated_data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="csv-reader-container">
      <input type="file" onChange={handleFileUpload} />
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
      />
      <table className="csv-table">
        <thead>
          <tr>
            {csvData[0] && Object.keys(csvData[0]).map((header, index) => (
              <th key={index}>{header}</th>
            ))}
            <th>Edit</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.entries(row).map(([key, value], columnIndex) => (
                <td key={columnIndex}>
                  {editableRowIndex === rowIndex ? (
                    <input
                      type="text"
                      value={editableRow[key] || ''}
                      onChange={(e) => handleInputChange(e, key)}
                    />
                  ) : (
                    value
                  )}
                </td>
              ))}
              <td>
                {editableRowIndex === rowIndex ? (
                  <button className="save-btn" onClick={handleSave}>Save</button>
                ) : (
                  <button className="edit-btn" onClick={() => handleEdit(rowIndex)}>Edit</button>
                )}
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(rowIndex)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="add-row-container">
        {csvData[0] && Object.keys(csvData[0]).map((key, index) => (
          <input
            key={index}
            type="text"
            placeholder={key}
            value={newRowData[key] || ''}
            onChange={(e) => handleNewRowChange(e, key)}
          />
        ))}
        <button className="add-row-btn" onClick={handleSave}>Add Row</button>
      </div>
      <button className="export-btn" onClick={handleExport}>Export CSV</button>
    </div>
  );
}

export default CSVReader;
