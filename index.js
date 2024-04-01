/// <reference lib="dom" />
//@ts-check
function getRandomEmojiList() {
  const lists = [
    ["🌹", "🌷", "🌻", "🌼", "🌸", " "], // Flowers
    ["🍏", "🍎", "🍐", "🍊", "🍋", " "], // Fruits
    ["🦄", "🐉", "🧞", "🧜‍♀️", "🦇", " "],
    ["😀", "😃", "😄", "😁", "😆", " "],
  ];

  return lists[Math.floor(Math.random() * lists.length)];
}

// const API_URL = "http://localhost:8000";
const API_URL = "https://ff6347-cruddy_draw_api.web.val.run";
const SITE_URL = window.location.href;

const emojiList = getRandomEmojiList(); // Add more emojis if needed
/**@type {{ id: number, emoji: string }[]} */
let gridData = []; // To store the state of the grid for serialization

/**
 * @param {unknown} target
 */
function updateEmoji(target) {
  if (!target.dataset.emoji) {
    throw new Error("No emoji data found");
  }

  const newEmoji =
    emojiList[(emojiList.indexOf(target.dataset.emoji) + 1) % emojiList.length];
  target.textContent = newEmoji;
  target.dataset.emoji = newEmoji;

  // update the gridData array with the new emoji
  // Find the object in the gridData array with the id and update the emoji
  const entry = gridData.find((cell) => {
    if (!target.dataset.id) {
      throw new Error("No id data found");
    }
    return cell.id === parseInt(target.dataset.id);
  });
  if (entry) entry.emoji = newEmoji;

  // Modify the state as per requirement here
}
let mouseDown = false;
/**
 * @param {string} emoji
 * @param {number} id
 */
function createCell(emoji, id) {
  const cell = document.createElement("div");
  cell.classList.add("cell", "non-selectable");
  cell.textContent = emoji;
  cell.dataset.id = `${id}`;
  cell.dataset.emoji = emoji;
  cell.addEventListener("mousedown", function (e) {
    mouseDown = true;
    updateEmoji(e.target);
  });

  // Mousemove event
  cell.addEventListener("mousemove", function (e) {
    if (mouseDown) {
      updateEmoji(e.target);
    }
  });

  // Mouseup event
  cell.addEventListener("mouseup", function () {
    mouseDown = false;
  });
  // how can I get the index from the emojiList array?
  // You can use the indexOf method to get the index of the emoji in the emojiList array
  // cell.addEventListener("click", function (e) {
  //   updateEmoji(e.target);
  // });
  return cell;
}

/**
 * @param {HTMLElement} container
 */
function populateWithGridData(container) {
  gridData.forEach((cellData) => {
    const cell = createCell(cellData.emoji, cellData.id);
    container.appendChild(cell);
  });
}

/**
 * @param {HTMLElement} container
 */
function populateGrid(container) {
  for (let i = 0; i < 400; i++) {
    // 40x40 grid
    const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
    const cell = createCell(emoji, i);
    container.appendChild(cell);
    gridData.push({ id: i, emoji: emoji });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  /** @type {string} */
  let sessionId;
  const container = document.getElementById("grid-container");
  if (!container) {
    throw new Error("No grid container found");
  }
  // detect if the come in with a query string that contains an id
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    console.log("No id provided");
    populateGrid(container);
  } else {
    // if there is an id we make a fetch GET call to the api to get the sdtored gridData
    sessionId = id;
    fetch(`${API_URL}?id=${sessionId}`, {
      // headers: {
      //   "Content-Type": "application/json",
      // },
    })
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        if (!json || !json.data) {
          populateGrid(container);
          return;
        }
        // update the gridData array with the data from the api
        // loop through the data and update the gridData array
        gridData = [...json.data];
        populateWithGridData(container);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  // Populate the grid

  // Example of serializing grid data to JSON

  // Define the event handler function
  /**
   * @param {KeyboardEvent} event
   */
  function handleKeyPress(event) {
    console.log(`Key pressed: ${event.key}`);
    console.log(`Key code: ${event.code}`);

    // Example: Perform an action based on a specific key
    if (event.key === "Enter") {
      console.log("Enter key was pressed.");
      // Insert the action you want to perform when the Enter key is pressed
    }
    if (event.key === "s") {
      if (sessionId) {
        fetch(`${API_URL}?id=${sessionId}`, {
          method: "PUT",
          // headers: {
          //   "Content-Type": "application/json",
          // },
          body: JSON.stringify(gridData),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
          });
      } else {
        // Serialize the grid data to JSON

        // console.log(serializedData);
        // this should make a fetch POST request to a api to write the data
        fetch(`${API_URL}`, {
          method: "POST",
          // headers: {
          //   "Content-Type": "application/json",
          // },
          body: JSON.stringify(gridData),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log("Success:", data);
            // set the id in the query string in the url for sharing
            window.history.pushState({}, "", `?id=${data.id}`);
            const link = document.querySelector("a#share-link");
            if (link && link instanceof HTMLAnchorElement) {
              link.href = `${SITE_URL}?id=${data.id}`;
            }
          });
      }
    }
  }

  // Add the keydown event listener to the document
  document.addEventListener("keydown", handleKeyPress);
});
