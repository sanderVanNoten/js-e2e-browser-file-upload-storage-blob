// ./src/azure-storage-blob.ts

// <snippet_package>
// THIS IS SAMPLE CODE ONLY - NOT MEANT FOR PRODUCTION USE
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";

const containerName = `landingzone`;
const sasToken = process.env.REACT_APP_AZURE_STORAGE_SAS_TOKEN;
const storageAccountName = process.env.REACT_APP_AZURE_STORAGE_RESOURCE_NAME;

// const isLocalClient = 

// </snippet_package>

// <snippet_get_upload_url>
const uploadLocalUrl = `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`;
const uploadCloudUrl = `https://${storageAccountName}.blob.core.windows.net`

// Create Two Blob Service Clients depending on local/cloud development
const blobServiceClientLocal = new BlobServiceClient(uploadLocalUrl);
const blobServiceClientCloud = new BlobServiceClient(uploadCloudUrl,defaultAzureCredential);

// get Container - full public read access
const containerClient = blobServiceClientCloud.getContainerClient(containerName);
// </snippet_get_client>

// <snippet_isStorageConfigured>
// Feature flag - disable storage feature to app if not configured

//Required? SasToken Is Actually optional when using MI 
// export const isStorageConfigured = () => {
//   return !storageAccountName || !sasToken ? false : true;
// };
// </snippet_isStorageConfigured>

// <snippet_getBlobsInContainer>
// return list of blobs in container to display
// export const getBlobsInContainer = async () => {
//   const returnedBlobUrls = [];

//   // get list of blobs in container
//   // eslint-disable-next-line
//   for await (const blob of containerClient.listBlobsFlat()) {
//     console.log(`${blob.name}`);

//     const blobItem = {
//       url: `https://${storageAccountName}.blob.core.windows.net/${containerName}/${blob.name}?${sasToken}`,
//       name: blob.name,
//     };

//     // if image is public, just construct URL
//     returnedBlobUrls.push(blobItem);
//   }

//   return returnedBlobUrls;
// };

// </snippet_getBlobsInContainer>

// <snippet_createBlobInContainer>
const createBlobInContainer = async (file, selectedOption) => {
  // Check if the file is a CSV
  const isCSV = file.name.toLowerCase().endsWith(".csv");

  if (!isCSV) {
    throw new Error("Only CSV files are allowed.");
  }
  // create blobClient for container
  const blobName = `Finances/${selectedOption}/${file.name}`;
  const blobClient = containerClient.getBlockBlobClient(blobName);

  // set mimetype as determined from browser with file upload control
  const options = { blobHTTPHeaders: { blobContentType: file.type } };

  // upload file
  await blobClient.uploadData(file, options);
};
// </snippet_createBlobInContainer>

// <snippet_uploadFileToBlob>
const uploadFileToBlob = async (file, selectedOption) => {
  if (!file || !selectedOption) return;

  try {
    // upload file
    await createBlobInContainer(file, selectedOption);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
// </snippet_uploadFileToBlob>

export default uploadFileToBlob;



// Example of Mickey Soft Code
// const { DefaultAzureCredential } = require("@azure/identity");
// const { BlobServiceClient } = require("@azure/storage-blob");
// const defaultAzureCredential = new DefaultAzureCredential();

// // Some code omitted for brevity.

// async function uploadBlob(accountName, containerName, blobName, blobContents) {
//     const blobServiceClient = new BlobServiceClient(
//         `https://${accountName}.blob.core.windows.net`,
//         defaultAzureCredential
//     );

//     const containerClient = blobServiceClient.getContainerClient(containerName);

//     try {
//         await containerClient.createIfNotExists();
//         const blockBlobClient = containerClient.getBlockBlobClient(blobName);
//         const uploadBlobResponse = await blockBlobClient.upload(blobContents, blobContents.length);
//         console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
//     } catch (error) {
//         console.log(error);
//     }
// }