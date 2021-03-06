/* global chrome */

// Gets selected text and converts it into an array, then sends to background script
window.addEventListener("mouseup", () => {
  const selectedText = window
    .getSelection()
    .toString()
    .trim();
  const ingredients = parseToArray(selectedText);
  if (ingredients.length) {
    chrome.runtime.sendMessage({ ingredients: ingredients });
  }
});

// Listening for a right-click command to open the modal window
chrome.runtime.onMessage.addListener(request => {
  if (request.type === "openModal") {
      chrome.storage.sync.set({
          'cbIsModal': true
      });
      document.body.innerHTML +=`<dialog style="height:315px; width:300px; background-color:#F2F2F2;" id="cookbook-dialog">
          <iframe style="height:290px; width:292px; position:absolute; top:25; left:0" id="cookbookFrame"></iframe>
          <div style="position:absolute; top:0px; left:5px;"><button>x</button></div></dialog>`;
      const iframe = document.getElementById("cookbookFrame");
      iframe.src = chrome.extension.getURL("index.html");
      iframe.frameBorder = 0;
      const dialog = document.querySelector("dialog");
      dialog.querySelector("button").addEventListener("click", function() {
        dialog.close();
      });
      dialog.showModal();
  }
});

// Helper functions
window.parseToArray = string => {
  const arr = string.split(/\n/);
  arr.forEach((str, index) => {
    // Take out unnecesary text
    const cutOffs = [str.indexOf(","), str.indexOf("(")];
    cutOffs.forEach(index => {
      if (index > 5) {
        str = str.substring(0, index);
      } else if (index > 0) {
        if (str.includes("can")) {
          str = convertFromCan(str, "can");
        } else if (str.includes("jar")) {
          str = convertFromCan(str, "jar");
        }
      }
    });
    arr[index] = str.trim();
    // Check for empty strings
    if (!str.replace(/\s/g, "").length) {
      arr[index] = undefined;
    }
  });
  // Remove empty strings
  return arr.filter(el => el !== undefined);
};

window.convertFromCan = (str, canOrJar) => {
  const realUnits = str.substring(str.indexOf("(") + 1, str.indexOf(")"));
  return realUnits + str.substring(str.indexOf(canOrJar) + 3);
};
