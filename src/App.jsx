import React, { useState, useEffect } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import uploadFileToBlob, {
  isStorageConfigured,
  getBlobsInContainer,
} from "./azure-storage-blob";
import DisplayImagesFromContainer from "./ContainerImages";

const storageConfigured = isStorageConfigured();

const msalConfig = {
  auth: {
    clientId: "8cf60b37-5dae-407d-944b-529dfc3d76a6",
    authority: "https://login.microsoftonline.com/didits.be",
    redirectUri: "http://localhost:3000" // Update with your app's redirect URI
  }
};

const loginRequest = {
  scopes: ["openid", "profile", "User.Read"]
};

const pca = new PublicClientApplication(msalConfig);

const App = () => {
  // all blobs in container
  const [blobList, setBlobList] = useState([]);

  // current file to upload into container
  const [fileSelected, setFileSelected] = useState();
  const [fileUploaded, setFileUploaded] = useState("");

  // UI/form management
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(Math.random().toString(36));

  // User management
  const [user, setUser] = useState(null);

  // *** GET FILES IN CONTAINER ***
  useEffect(() => {
    getBlobsInContainer().then((list) => {
      // prepare UI for results
      setBlobList(list);
    });
  }, [fileUploaded]);

  useEffect(() => {
    const handleResponse = (response) => {
      if (response !== null) {
        setUser(response.account);
      }
    };

    const login = async () => {
      try {
        const accounts = await pca.getAllAccounts();
        if (accounts.length === 0) {
          const response = await pca.loginPopup(loginRequest);
          handleResponse(response);
        } else if (accounts.length === 1) {
          const response = await pca.acquireTokenSilent({
            account: accounts[0],
            ...loginRequest
          });
          handleResponse(response);
        }
      } catch (error) {
        console.log(error);
      }
    };

    login();
  }, []);

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
  const handleDropdownChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const loginWithAzureAD = async () => {
    try {
      const response = await pca.loginPopup(loginRequest);
      handleResponse(response);
    } catch (error) {
      console.log(error);
    }
  };

  const logoutWithAzureAD = () => {
    pca.logout();
    setUser(null);
  };

  const handleResponse = (response) => {
    if (response !== null) {
      setUser(response.account);
    }
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
      {user ? (
        <>
          <p>Welcome, {user.name}!</p>
          <button onClick={logoutWithAzureAD}>Logout</button>
          {storageConfigured && !uploading && DisplayForm()}
          {storageConfigured && uploading && <div>Uploading</div>}
          <hr />
          {storageConfigured && blobList.length > 0 && (
            <DisplayImagesFromContainer blobList={blobList} />
          )}
        </>
      ) : (
        <>
          <button onClick={loginWithAzureAD}>Login with Azure AD</button>
          {!storageConfigured && <div>Storage is not configured.</div>}
        </>
      )}
    </div>
  );
};

export default App;
