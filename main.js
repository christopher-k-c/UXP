const { entrypoints } = require("uxp");

  runScript = () => {
    alert("This is an alert message");
  }

  entrypoints.setup({
    commands: {
      runScript,
    },
    panels: {
      vanilla: {
        show(node ) {
        }
      }
    }
  });


// Access to the local file system plus "plugin:", "plugin-data:", and "plugin-temp:" folders using the prefix in getEntryWithUrl()
// Made sure to update the manifest with "requiredPermissions": {"localFileSystem": "fullAccess"} 
// FS Documentation: https://developer.adobe.com/photoshop/uxp/2022/uxp-api/reference-js/Modules/fs/
const fsProvider = require('uxp').storage.localFileSystem;
const app = require('photoshop').app


// Test Function 
async function foo() {
    // Access other location
    if (fsProvider.isFileSystemProvider) {
      try {
        const activeDocumentPath = app.activeDocument.path;
        const result = activeDocumentPath.replace(/\/[^/]*$/, "");
        const pluginFolder = await fsProvider.getEntryWithUrl(result); // update the path based on your system
        console.log(`File path: ${pluginFolder.nativePath}`);
      } catch (e) {
        console.error(e);
      }
    }
}

document.getElementById("btnPopulate").addEventListener("click", foo);
































