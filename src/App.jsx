import React, { useState, useEffect } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import uploadFileToBlob, {
  isStorageConfigured,
  getBlobsInContainer,
} from "./azure-storage-blob";
import DisplayImagesFromContainer from "./ContainerImages";
import './App.css';
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';

const storageConfigured = isStorageConfigured();

const msalConfig = {
  auth: {
    clientId: "8cf60b37-5dae-407d-944b-529dfc3d76a6",
    authority: "https://login.microsoftonline.com/didits.be",
    redirectUri: "https://victorious-moss-0e18e0003.3.azurestaticapps.net" // Update with your app's redirect URI
  }
};

const loginRequest = {
  scopes: ["openid", "profile", "User.Read"]
};

const pca = new PublicClientApplication(msalConfig);

const App = () => {
  // all blobs in container
  const [blobList, setBlobList] = useState([]);

  // current files to upload into container
  const [filesSelected, setFilesSelected] = useState([]);
  const [filesUploaded, setFilesUploaded] = useState([]);

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
  }, [filesUploaded]);

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
    // capture files into state
    setFilesSelected(Array.from(event.target.files));
  };

let sessionIdCounter = 0;

const generateSessionId = () => {
  const timestamp = Date.now();
  sessionIdCounter++;
  return `${timestamp}_${sessionIdCounter}`;
};

const onFileUpload = async () => {
  if (filesSelected.length > 0 && selectedOption) {
    // prepare UI
    setUploading(true);

    try {
      // *** UPLOAD FILES TO AZURE STORAGE ***
      const uploadPromises = filesSelected.map((file) =>
        uploadFileToBlob(file, selectedOption)
      );

      // Concatenate filenames with the user's name
      const usernameFileContent = filesSelected.reduce(
        (content, file) => content + file.name + "\n",
        user.name + " uploaded the following files:\n"
      );

      // Create username file with a custom session ID in the filename
      const sessionId = generateSessionId();
      const usernameFile = new File(
        [usernameFileContent],
        `metadata_${sessionId}.txt`
      );
      const usernameUploadPromise = uploadFileToBlob(
        usernameFile,
        selectedOption
      );

      // Combine all upload promises
      const allUploadPromises = [...uploadPromises, usernameUploadPromise];

      await Promise.all(allUploadPromises);

      // reset state/form
      setFilesSelected([]);
      setFilesUploaded(filesSelected.map((file) => file.name));
      setUploading(false);
      setInputKey(Math.random().toString(36));
    } catch (error) {
      // Display error message
      console.error("Error uploading files:", error);
      // Show error message to the user
      alert("Only CSV files are allowed.");
      // Reset state/form
      setFilesSelected([]);
      setUploading(false);
      setInputKey(Math.random().toString(36));
    }
  } else {
    // No option selected or no files selected
    alert("Please choose a bank and select at least one file!");
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
        <input className = "upload" type="file" onChange={onFileChange} key={inputKey || ""} multiple />
       
      </div>
      <div>
        <Form.Select value={selectedOption} onChange={handleDropdownChange} className="form">
          <option value="">Select another option</option>
          <option value="KBC">KBC</option>
          <option value="VDK">VDK</option>
          <option value="Crelan">Crelan</option>
        </Form.Select>
        <div>
      <Button variant="secondary" type="submit" onClick={onFileUpload} className="custom-btn">
          Upload!
      </Button>

      <Button onClick={logoutWithAzureAD} className="logout">Logout</Button>
      </div>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar expand="lg" className="bg-body-tertiary" bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="#home">Dieter Stinkt</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#home">Dieter</Nav.Link>
            <Nav.Link href="#link">Is</Nav.Link>
            <NavDropdown title="Lelijk" id="basic-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
              <NavDropdown.Item href="#action/3.2">
                Another action
              </NavDropdown.Item>
              <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.4">
                Separated link
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
      <Container>
      <Row>
        <Col sm={12}><h1>Upload file to Azure Blob Storage</h1></Col>
      </Row>
        <Col sm={12}>{user ? (
        <>
          <p>Welcome, {user.name}!</p>
          {storageConfigured && !uploading && DisplayForm()}
          {storageConfigured && uploading && <div>Uploading</div>}
          <hr />
          {storageConfigured && blobList.length > 0 && (
            <DisplayImagesFromContainer blobList={blobList} />
          )}
        </>
      ) : (
        <>
          <Button onClick={loginWithAzureAD}>Login with Azure AD</Button>
          {!storageConfigured && <div>Storage is not configured.</div>}
        </>
      )}</Col>
      <Row>

      </Row>
    </Container>
      {/* {user ? (
        <>
          <p>Welcome, {user.name}!</p>
          <Button onClick={logoutWithAzureAD}>Logout</Button>
          {storageConfigured && !uploading && DisplayForm()}
          {storageConfigured && uploading && <div>Uploading</div>}
          <hr />
          {storageConfigured && blobList.length > 0 && (
            <DisplayImagesFromContainer blobList={blobList} />
          )}
        </>
      ) : (
        <>
          <Button onClick={loginWithAzureAD}>Login with Azure AD</Button>
          {!storageConfigured && <div>Storage is not configured.</div>}
        </>
      )} */}

    </div>
  );
};
console.log("werkt het nu?");
export default App;