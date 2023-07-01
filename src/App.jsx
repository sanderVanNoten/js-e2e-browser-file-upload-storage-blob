// ./src/App.tsx

import React, { useState, useEffect } from "react";
import uploadFileToBlob, {
  isStorageConfigured,
  getBlobsInContainer,
} from "./azure-storage-blob";
import DisplayImagesFromContainer from "./ContainerImages";
const storageConfigured = isStorageConfigured();

const App = () => {
  // all blobs in container
  const [blobList, setBlobList] = useState([]);

  // current file to upload into container
  const [fileSelected, setFileSelected] = useState();
  const [fileUploaded, setFileUploaded] = useState("");

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  // *** GET FILES IN CONTAINER ***
  useEffect(() => {
    getBlobsInContainer().then((list) => {
      // prepare UI for results
      setBlobList(list);
    });
  }, [fileUploaded]);

  const onFileChange = (event) => {
    // capture file into state
    setFileSelected(event.target.files[0]);
  };

  const onFileUpload = async () => {
  if (fileSelected && fileSelected.name && selectedOption) {
    // prepare UI
    setUploading(true);

    try {
      // *** UPLOAD TO AZURE STORAGE ***
      await uploadFileToBlob(fileSelected, selectedOption);

      // reset state/form
      setFileSelected(null);
      setFileUploaded(fileSelected.name);
      setUploading(false);
      setInputKey(Math.random().toString(36));
    } catch (error) {
      // Display error message
      console.error("Error uploading file:", error);
      // Show error message to the user
      alert("Only CSV files are allowed.");
      // Reset state/form
      setFileSelected(null);
      setUploading(false);
      setInputKey(Math.random().toString(36));
    }
  } else {
    // No option selected
    alert("Please choose a bank!");
  }
};

  const [selectedOption, setSelectedOption] = useState("");
  console.log(selectedOption);
  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };
  // display form
  const DisplayForm = () => (
    <div>
      <div>
        <input type="file" onChange={onFileChange} key={inputKey || ""} />
        <button type="submit" onClick={onFileUpload}>
          Upload!
        </button>
      </div>
      <div>
        <select value={selectedOption} onChange={handleDropdownChange}>
          <option value="">Select another option</option>
          <option value="KBC">KBC</option>
          <option value="VDK">VDK</option>
          <option value="Crelan">Crelan</option>
        </select>
      </div>
    </div>
  );

  return (
    <div>
      <h1>Upload file to Azure Blob Storage</h1>
      {storageConfigured && !uploading && DisplayForm()}
      {storageConfigured && uploading && <div>Uploading</div>}
      <hr />
      {storageConfigured && blobList.length > 0 && (
        <DisplayImagesFromContainer blobList={blobList} />
      )}
      {!storageConfigured && <div>Storage is not configured.</div>}
    </div>
  );
};

export default App;
