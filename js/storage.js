// Small helpers to save and load lists in the browser (localStorage)

function getList(key) {
  var saved = localStorage.getItem(key);
  if (saved === null) {
    return [];
  }
  return JSON.parse(saved);
}

function addToList(key, item) {
  var list = getList(key);
  list.push(item);
  localStorage.setItem(key, JSON.stringify(list));
}

// Makes typed text safe to show on the page
function safe(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function validEmail(email) {
  return email.indexOf("@") > 0 && email.indexOf(".") > email.indexOf("@");
}
