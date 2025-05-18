let numPairs = 3;
let clickCount = 0;
let matchesMade = 0;
let totalTime = 60;
let timer;
const backImage = "public/img/back.webp";

function getDifficultyValue() {
  const level = $("#difficulty").val();
  if (level === "medium") return 6;
  if (level === "hard") return 9;
  return 3;
}

async function getRandomPokemonIDs(count) {
  const max = 700;
  const ids = new Set();
  while (ids.size < count) {
    ids.add(Math.floor(Math.random() * max) + 1);
  }
  return Array.from(ids);
}

async function getPokemonImageURL(id) {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    const data = await response.json();
    return data.sprites.other["official-artwork"].front_default;
  } catch (err) {
    console.error("Failed to fetch from PokéAPI:", err);
    return null;
  }
}


async function setup() {
  clearInterval(timer);
  $("#game_grid").empty();

  $("#game_grid")
    .removeClass("easy medium hard")
    .addClass($("#difficulty").val());

  // Reset stats
  clickCount = 0;
  matchesMade = 0;
  numPairs = getDifficultyValue();
  totalTime = numPairs * 20;

  // Update UI
  $("#clickCount").text("0");
  $("#matchesMade").text("0");
  $("#totalPairs").text(numPairs);
  $("#timeLeft").text(totalTime);

  startTimer();

  const pokemonIDs = await getRandomPokemonIDs(numPairs);
  console.log("Selected Pokémon IDs:", pokemonIDs);

  const cards = [];

  for (const id of pokemonIDs) {
    const url = await getPokemonImageURL(id);
    if (!url) continue;

    for (let i = 0; i < 2; i++) {
      cards.push(`
        <div class="card">
          <img class="front_face" src="${url}" alt="pokemon" />
          <img class="back_face" src="${backImage}" alt="back" />
        </div>
      `);
    }
  }

  // Shuffle and render
  cards.sort(() => Math.random() - 0.5);
  cards.forEach(cardHTML => $("#game_grid").append($(cardHTML)));

  addClickHandlers();
}

function addClickHandlers() {
  let firstCard = null;
  let secondCard = null;
  let lockBoard = false;

  $(".card").on("click", function () {
    if (lockBoard || $(this).hasClass("flip")) return;

    $(this).addClass("flip");

    if (!firstCard) {
      firstCard = $(this);
      clickCount++;
      $("#clickCount").text(clickCount);
      return;
    }

    secondCard = $(this);
    lockBoard = true;
    clickCount++;
    $("#clickCount").text(clickCount);

    const firstImg = firstCard.find(".front_face").attr("src");
    const secondImg = secondCard.find(".front_face").attr("src");

    if (firstImg === secondImg) {
      firstCard.off("click");
      secondCard.off("click");
      matchesMade++;
      $("#matchesMade").text(matchesMade);
      if (matchesMade === numPairs) {
          clearInterval(timer);
          showModal("🎉 You win!", "You matched all the cards!");
      }

      resetTurn();
    } else {
      setTimeout(() => {
        firstCard.removeClass("flip");
        secondCard.removeClass("flip");
        resetTurn();
      }, 1000);
    }
  });

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
  }
}

function startTimer() {
  clearInterval(timer);
  timer = setInterval(() => {
    totalTime--;
    $("#timeLeft").text(totalTime);
    if (totalTime <= 0) {
        clearInterval(timer);
        showModal("⏰ Time's up!", "Game over.");
    }
  }, 1000);
}

$(document).ready(() => {
  $("#startBtn").on("click", setup);
  $("#resetBtn").on("click", setup);

  $("#themeToggle").on("change", function () {
    $("body").toggleClass("dark", this.checked);
  });

  $("#powerUpBtn").on("click", () => {
    $(".card").addClass("flip");
    setTimeout(() => {
      $(".card").removeClass("flip");
    }, 5000);
  });
});

function showModal(title, message) {
  $("#modalTitle").text(title);
  $("#modalMessage").text(message);
  $("#gameModal").removeClass("hidden");
}

$("#modalCloseBtn").on("click", function () {
  $("#gameModal").addClass("hidden");
  setup(); // Start a new game
});

