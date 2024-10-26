/**
 * Parses a time string in the format "mm:ss.xx" and returns the time in seconds.
 *
 * @param {string} timeStr - The time string to parse.
 * @returns {number} - The time in seconds.
 */
function parseTime(timeStr) {
    var parts = timeStr.split(":");
    return +parts[0] * 60 + +parts[1];
}

/**
 * Parses the content of an LRC file and returns an array of objects containing time and lyrics.
 *
 * @returns {Array} - An array of objects, each containing 'time' (in seconds) and 'words' (lyrics) properties.
 */
function parseLrc() {
    var lines = lrc.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
        var parts = lines[i].split("]");
        var obj = {
            time: parseTime(parts[0].substring(1)),
            words: parts[1]
        };
        result.push(obj);
    }

    return result;
}

/**
 * Finds the index of the highlighted lyrics based on the current audio time.
 *
 * @returns {number} - The index of the highlighted lyrics in the lrcData array or -1 if no lyrics should appear.
 */
function findHighlightIndex() {
    var curTime = doms.audio.currentTime;
    for (var i = 0; i < lrcData.length; i++) {
        if (curTime < lrcData[i].time) {
            return i - 1;
        }
    }
    return lrcData.length - 1;
}

/**
 * Gets the DOM elements for the audio player and the container for the lyrics.
 */
function getDOMs() {
    doms.audio = document.querySelector('audio');
    doms.ul = document.querySelector('.container ul');
    doms.container = document.querySelector('.container');
}

/**
 * Creates and appends list items for each line of lyrics in the lrcData array.
 */
function createElement() {
    for (var i = 0; i < lrcData.length; i++) {
        var li = document.createElement('li');
        li.textContent = lrcData[i].words;
        doms.ul.appendChild(li);
    }
}

/**
 * Optimized function to create and append list items using a document fragment for efficiency.
 */
function createElementEfficiency() {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < lrcData.length; i++) {
        var li = document.createElement('li');
        li.textContent = lrcData[i].words;
        frag.appendChild(li);
    }
    doms.ul.appendChild(frag);
}

/**
 * Calculates and stores the heights of the container, ul, and li elements for further calculations.
 */
function getDOMsHeight() {
    containerHeight = doms.container.clientHeight;
    ulHeight = doms.ul.clientHeight;
    liHeight = doms.ul.children[0].clientHeight;
    maxoffset = ulHeight - containerHeight;
}

/**
 * Sets the offset for scrolling the lyrics based on the current time and highlights the current lyrics.
 */
function setOffset() {
    var index = findHighlightIndex();

    var curLrcHeight = liHeight * index + liHeight / 2;
    var offset = curLrcHeight - containerHeight / 2;
    if (offset < 0) {
        offset = 0;
    }
    if (offset > maxoffset) {
        offset = maxoffset;
    }

    doms.ul.style.transform = `translateY(-${offset}px)`;

    var highLightLi = doms.ul.querySelector('.active');
    if (highLightLi) {
        highLightLi.classList.remove('active');
    }

    highLightLi = doms.ul.children[index];
    if (highLightLi) {
        highLightLi.classList.add('active');
    }
}

// Parse the LRC data and store it in the lrcData array
var lrcData = parseLrc();
// Object to store references to important DOM elements
var doms = {};
var containerHeight, ulHeight, liHeight, maxoffset;

// Event listener to initialize the application once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
    getDOMs();
    createElement();
    getDOMsHeight();
    doms.audio.addEventListener('timeupdate', setOffset);
});
