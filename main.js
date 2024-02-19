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
const activeDocumentPath = app.activeDocument.path;
const result = activeDocumentPath.replace(/\/[^/]*$/, "");

function appendText(msg){
  const errorMessage = document.getElementById('layers');
  errorMessage.textContent = msg;
}

async function openImage(param) {
  try {
    // Pass the path into the getEntryWithUrl for the file object
    const getObject = await fsProvider.getEntryWithUrl(param);
    // Execute app.open() within modal scope
    await require('photoshop').core.executeAsModal(async (executionContext, descriptor) => {
      // Try and open image
      try {
        // Open Image
        await app.open(getObject);
        // Update the plugin activity log
        appendText('File opened successfully.')  
      } catch (e) {
        // Log error to the plugin activity log
        appendText(e)
      }
    }, { "commandName": "Open Image" });
  } catch (e) {
    // Log error to the plugin activity log
    appendText(e)
  }
}

async function findFolder() {
    // Access other location
    if (fsProvider.isFileSystemProvider) {
      try {
        // Access the active documents path 
        const pluginFolder = await fsProvider.getEntryWithUrl(result);     
        // Get the contents of the active documents path 
        const folderArray = await pluginFolder.getEntries();
        // Retouch Notes folder name
        const retouchNoteFolder = "Retouch Notes"
        // Set a variable that keeps track of found retouch note images
        let retouchNotesFound = false;
        // loop through the array of contents
        for(const obj of folderArray){
          // If the Retouch Notes folder exists 
          if(obj.name == retouchNoteFolder){
            // Get the path the Retouch Notes path
            const rnpath = await fsProvider.getEntryWithUrl(obj.nativePath)
            // Get the contents of the folder
            const rnEntries = await rnpath.getEntries();
            // Loop through the rnEntries array 
            for(const note of rnEntries){
              // Regex that removes the _R.jpg
              const pattern = /_R\.jpg/g;
              // Store the current iterations name 
              const name = note.name;
              // Remove the _R.jpg from the name variable 
              let cleanedName = name.replace(pattern, '');
              // Handle first image exceptions 
              let updatingCleanedName = cleanedName.includes('M0') ? cleanedName.replace('M0', '') : cleanedName;
              
              cleanedName = updatingCleanedName
              // Get the active documents name 
              const activeName = app.activeDocument.name
              // Regex that removes everything from the . onwards  
              var regex = /\..*/;
              // Update the active name with the regex pattern 
              var activeDocumentName = activeName.replace(regex, "")
              // If the active document name and the retouch notes image match call the openImage function else return error
              cleanedName === activeDocumentName ? await openImage(note.nativePath) : appendText("No retouch notes available");
              // if(cleanedName === activeDocumentName){await openImage(note.nativePath)}else{
              //   appendText("No retouch notes available");
              // }
              if(cleanedName === activeDocumentName){
                await openImage(note.nativePath);
                retouchNotesFound = true;
                break;
              }
            }
          }
        };
        if (!retouchNotesFound) {
          appendText("No retouch notes available");
        }
      } catch (e) {
        appendText(e)
      }
    }
}
document.getElementById("btnPopulate").addEventListener("click", findFolder);

  // .then(folderExists => {
  //   findMatchingFiles(folderExists, result)
  // })
  // .catch(error => console.error("Error:", error));


async function findMatchingFiles(folderArray, path){
  const name = app.activeDocument.name.split("").slice(0,9).join("")
  for(const obj of folderArray){
    if(name == obj.name.split("").slice(0,9).join("")){
      console.log(`${obj.name} is a match!`);
      console.log(`${path}/${obj.name}`)
    }
  };
}
























