// Branch and menu information. To add a branch or drink, add one more line here.

var branches = [
  { id: "capipisa", name: "Capipisa, Tanza – Main Branch", area: "Tanza, Cavite", region: "Cavite", note: "Original and main branch of Café BLK & BRWN." },
  { id: "naic", name: "Naic Branch", area: "Naic, Cavite", region: "Cavite", note: "Serves customers within the Naic area." },
  { id: "gentri", name: "General Trias Branch", area: "General Trias, Cavite", region: "Cavite", note: "Expands the café’s presence within Cavite." },
  { id: "kawit", name: "Kawit Branch", area: "Kawit, Cavite", region: "Cavite", note: "Another accessible location for Cavite customers." },
  { id: "trece", name: "Trece Martires Branch", area: "Trece Martires City, Cavite", region: "Cavite", note: "Extends the brand toward the Tanza–Trece Martires area." },
  { id: "smtanza", name: "SM City Tanza Branch", area: "SM City Tanza, Cavite", region: "Cavite", note: "Mall-based location serving customers within the area." },
  { id: "festival", name: "Festival Mall Alabang Branch", area: "Festival Mall, Alabang, Metro Manila", region: "Metro Manila", note: "Mall-based location extending the brand into Metro Manila." }
];

// price: "" means the price is not confirmed yet
var sample = "Sample item – details pending.";
var extra = "Add ₱25 for extra shot";

var menu = {
  "Coffee": [
    { name: "Espresso", desc: sample, price: "" },
    { name: "Americano", desc: sample, price: "" },
    { name: "Latte", desc: sample, price: "" }
  ],
  "Kape Series": [
    { name: "Kape sample 1", desc: sample, price: "" },
    { name: "Kape sample 2", desc: sample, price: "" }
  ],
  "Chai Blend": [
    { name: "Chai sample 1", desc: sample, price: "" },
    { name: "Chai sample 2", desc: sample, price: "" }
  ],
  "Choco Series": [
    { name: "Choco sample 1", desc: sample, price: "" },
    { name: "Choco sample 2", desc: sample, price: "" }
  ],
  "Over-Ice Series": [
    { name: "Iced sample 1", desc: sample, price: "" },
    { name: "Iced sample 2", desc: sample, price: "" }
  ],
  "Freskaró Juices": [
    { name: "Trueberries", desc: extra, price: "110" },
    { name: "AVC", desc: extra, price: "100" },
    { name: "Lychee", desc: extra, price: "100" },
    { name: "Healtea", desc: extra, price: "95" },
    { name: "Lemonade", desc: extra, price: "95" },
    { name: "Passion Fruit", desc: extra, price: "100" },
    { name: "Pineapple", desc: extra, price: "95" },
    { name: "Four Seasons", desc: extra, price: "95" }
  ],
  "Hot Beverages": [
    { name: "Hot sample 1", desc: sample, price: "" },
    { name: "Hot sample 2", desc: sample, price: "" }
  ],
  "Food & Snacks": [
    { name: "Pasta (sample)", desc: sample, price: "" },
    { name: "Sandwich (sample)", desc: sample, price: "" }
  ]
};
