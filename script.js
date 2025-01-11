
// readable time format function ---start---
function formatTime(time) {
  let minutes = Math.floor(time / 60);
  let seconds = Math.floor(time % 60);
  return `${minutes < 10 ? "0" + minutes : minutes}:${
    seconds < 10 ? "0" + seconds : seconds
  }`;
}
// readable time format function ---start---


// fetching songs for card --start--
var songs;
let currentFolder;
async function findSongs(folder) {
  currentFolder = folder;
  let response = await fetch(`./cards/${folder}/`);
  // console.log(response);
  let data = await response.text();
  // console.log(data);
  let div = document.createElement("div");
  div.innerHTML = data;
  //   console.log(div);
  let anchorElements = div.querySelectorAll("a");
  //   console.log(anchorElements); // yha par hame anchor tags ka ek nodelist milta hai jo ki 11 elements hai...
  let anchorArray = Array.from(anchorElements); //nodelist ko array me convert kra hai jisme 11 elements store hai, kyuki hamare nodelist ke first element me koi bhi mp3 file nahi hai...
  //   console.log(anchorArray);
  anchorArray.shift(); // bnaye hue array me first index ke element me koi bhi mp3 file na hone ke karan usko shift kiya hai yani remove, ab 10 elements bche hai array me
  //   console.log(anchorArray);
  songs = [];
  anchorArray.forEach(function (element) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
  });
}
// fetching songs for card --end--

// default songs function ---start---
// yeh function left display me default songs ke liye bnaya gya hai jo songs directly fetch ho rhe hai default songs folder se
async function defaultSongs() {
  let response2 = await fetch("./defaultsongs");
  let data2 = await response2.text();
  let div = document.createElement("div");
  div.innerHTML = data2;
  let anchorElements = div.querySelectorAll("a");
  let anchorArray = Array.from(anchorElements);
  anchorArray.shift();
  songs = [];
  anchorArray.forEach(function (element) {
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href);
    }
    return songs;
  });

  let LeftSongsCardContainer = document.querySelector(
    ".LeftSongsCardContainer"
  );
  // Clear the container first
  LeftSongsCardContainer.innerHTML = "";

  // Wait for the songs to be fetched before updating the container
  songs.forEach(function (song) {
    LeftSongsCardContainer.innerHTML += `
              <div class="leftSongCard flex align-center relative">
                <div class="music-icon flex align-center justify-center">
                  <i class="ri-music-2-fill"></i>
                </div>
                <div>
                  <div class="songName">${song
                    .replace(/^.*\//, "")
                    .replace(/%20/g, " ")
                    .replace(/.mp3$/, "")}</div>
                  <div class="artistName">Album</div>
                </div>
                <div class="musicPlayBtn flex justify-center align-center absolute">
                  <i class="ri-play-large-fill"></i>
                </div>
              </div>
            `;
  });
  document.querySelectorAll(".leftSongCard").forEach(function (card, index) {
    card.addEventListener("click", function () {
      playSong(index); // Call the global playSong function
    });
  });
}
defaultSongs();
// default songs function ---end---


// function for play music  --- start ---
let currentAudio = null;
let isMuted = false;
function playSong(index) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    play.src = "images/play.svg";
  }

  currentSongIndex = index;
  let songURL = songs[index];
  document.querySelector("#songDetails").innerHTML = `${songURL
    .replace(/^.*\//, "")
    .replace(/%20/g, " ")
    .replace(".mp3", "")}`;

  currentAudio = new Audio(songURL);
  currentAudio.volume = isMuted ? 0 : 1; // Set the initial volume based on the muted state
  currentAudio.play();
  play.src = "images/pause.svg";

  // eventlistioner for auto play next song
  currentAudio.addEventListener("ended", function () {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
  });

  // time update for song
  currentAudio.addEventListener("timeupdate", function () {
    document.querySelector(".songStartTime").innerHTML = formatTime(
      currentAudio.currentTime
    );
    document.querySelector(".songTotalTime").innerHTML = formatTime(
      currentAudio.duration
    );
    document.querySelector(".circle").style.left =
      (currentAudio.currentTime / currentAudio.duration) * 100 + "%";
  });

  // update song time by clicking seekbar
  document.querySelector(".seekBar").addEventListener("click", function (e) {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentAudio.currentTime = (currentAudio.duration * percent) / 100;
  });

  // update song time by dragging seekbar --start
  let seekBar = document.querySelector(".seekBar");
  let circle = document.querySelector(".circle");

  let isDragging = false;

  seekBar.addEventListener("touchstart", function (e) {
    isDragging = true;
    updateSeek(e.touches[0].clientX);
  });

  seekBar.addEventListener("touchmove", function (e) {
    if (isDragging) {
      updateSeek(e.touches[0].clientX);
    }
  });

  seekBar.addEventListener("touchend", function () {
    isDragging = false;
  });

  function updateSeek(clientX) {
    let rect = seekBar.getBoundingClientRect();
    let percent = (clientX - rect.left) / rect.width;
    percent = Math.min(1, Math.max(0, percent)); // clamp between 0 and 1
    circle.style.left = percent * 100 + "%";
    currentAudio.currentTime = currentAudio.duration * percent;
  }
}
// function for play music  --- end ---



// function for control play bar menu ---start---
async function playBarMenual() {
  let play = document.getElementById("play");
  play.addEventListener("click", function () {
    if (currentAudio && !currentAudio.paused) {
      currentAudio.pause();
      play.src = "images/play.svg";
    } else {
      if(!currentAudio){
        defaultSongs();
        playSong(0);
      }else{
        currentAudio.play();
        play.src = "images/pause.svg";
      }
      
    }
  });

  let prevBtn = document.getElementsByClassName("previousSong")[0];
  prevBtn.addEventListener("click", function () {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
  });

  let nextBtn = document.getElementsByClassName("nextSong")[0];
  nextBtn.addEventListener("click", function () {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
  });
}
playBarMenual();
// function for control play bar menu ---end---

// function to update card songs on playlist  ---start---
async function leftDisplayUpdate() {
  let cardsContainer = document.querySelector(".cardsContainer");
  let response = await fetch(`./cards/`);
  let data = await response.text();
  let div = document.createElement("div");
  div.innerHTML = data;
  let anchors = div.getElementsByTagName("a");

  Array.from(anchors).forEach(async function (e) {
    if (e.href.includes("/cards/")) {
      let folder = decodeURIComponent(e.href.split("/").slice(-1)[0]);
      // console.log(folder);

      let data = await fetch(`./cards/${folder}/info.json`);
      let response = await data.json();

      let card = document.createElement("div");
      card.setAttribute("data-folder", folder);
      card.classList.add("card", "flex", "justify-center", "align-center");
      card.innerHTML = `
        <div class="cardImg over-hide">
            <img src="/cards/${folder}/cover.jpg">
        </div>
        <div class="playBtn flex justify-center align-center">
            <i class="ri-play-fill"></i>
        </div>
        <div class="caption">
            <h3>${response.title}</h3>
            <p>${response.description}</p>
        </div>
      `;

      cardsContainer.appendChild(card);

      // Add event listener here after each card is created and appended
      card.addEventListener("click", async function (item) {
        let LeftSongsCardContainer = document.querySelector(
          ".LeftSongsCardContainer"
        );
        await findSongs(item.currentTarget.dataset.folder);

        // Clear the container first
        LeftSongsCardContainer.innerHTML = "";

        // Wait for the songs to be fetched before updating the container
        songs.forEach(function (song) {
          LeftSongsCardContainer.innerHTML += `
            <div class="leftSongCard flex align-center relative">
              <div class="music-icon flex align-center justify-center">
                <i class="ri-music-2-fill"></i>
              </div>
              <div>
                <div class="songName">${song
                  .replace(/^.*\//, "")
                  .replace(/%20/g, " ")
                  .replace(/.mp3$/, "")}</div>
                <div class="artistName">Album</div>
              </div>
              <div class="musicPlayBtn flex justify-center align-center absolute">
                <i class="ri-play-large-fill"></i>
              </div>
            </div>
          `;
        });
        document
          .querySelectorAll(".leftSongCard")
          .forEach(function (card, index) {
            card.addEventListener("click", function () {
              playSong(index); // Call the global playSong function
            });
          });
      });
    }
  });
}
leftDisplayUpdate();
// function to update card songs on playlist  ---end---



// function to side bar for small screen ---start---
let hamBurger = document.querySelector(".hamBurger");
let leftBox = document.querySelector(".left");
let position = true;
let isDragging = false;
let startX, currentX;

hamBurger.addEventListener("click", function () {
  if (position === true) {
    leftBox.style.left = "0%";
    position = false;
  } else {
    leftBox.style.left = "-100%";
    position = true;
  }
});

// Add touch event listeners for dragging
leftBox.addEventListener("touchstart", handleTouchStart, false);
leftBox.addEventListener("touchmove", handleTouchMove, false);
leftBox.addEventListener("touchend", handleTouchEnd, false);

function handleTouchStart(e) {
  isDragging = true;
  startX = e.touches[0].clientX;
  currentX = startX;
}

function handleTouchMove(e) {
  if (isDragging) {
    currentX = e.touches[0].clientX;
    let offsetX = currentX - startX;
    let leftPosition = (offsetX / window.innerWidth) * 100;
    if (leftPosition < 0) {
      leftBox.style.left = `${leftPosition}%`;
    }
  }
}

function handleTouchEnd() {
  isDragging = false;
  let currentLeft = parseInt(leftBox.style.left);
  if (currentLeft < -20) {
    leftBox.style.left = "-100%";
    position = true;
  } else {
    leftBox.style.left = "0%";
    position = false;
  }
}
// function to side bar for small screen ---end---


// function for customized scrollbar ---start---
// Wait for the DOM content to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  // Get the element with the class 'scrollableContent'
  const scrollableContent = document.querySelector(".scrollableContent");

  // Modify the scrollbar style
  scrollableContent.style.scrollbarWidth = "thin"; // Set scrollbar width
  scrollableContent.style.scrollbarColor = "white rgb(25, 24, 24)"; // Set scrollbar color
});

document.addEventListener("DOMContentLoaded", function () {
  const cardsContainer = document.querySelector(".cardsContainer");
  cardsContainer.style.scrollbarWidth = "thin";
  cardsContainer.style.scrollbarColor = "white rgb(25, 24, 24)";
});

// function for customized scrollbar ---end---


// Mute/Unmute functionality
const volumeBtn = document.querySelector('.volumeBtn');
const volumeIcon = volumeBtn.querySelector('i');

volumeBtn.addEventListener('click', toggleMute);

function toggleMute() {
  isMuted = !isMuted;
  if (currentAudio) {
    currentAudio.volume = isMuted ? 0 : 1;
  }
  updateVolumeIcon();
}

function updateVolumeIcon() {
  volumeIcon.classList.toggle('ri-volume-down-fill');
  volumeIcon.classList.toggle('ri-volume-mute-line');
}
