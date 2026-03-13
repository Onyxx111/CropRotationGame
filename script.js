/* AUDIO */

/* BACKGROUND MUSIC */

const bgMusic = new Audio("audio/background.mp3")

bgMusic.loop = true
bgMusic.volume = 0.4

let musicMuted = false

/* Start music when page loads */

window.addEventListener("load", () => {

    bgMusic.play().catch(() => {

        /* Some browsers require interaction */
        document.body.addEventListener("click", () => {

            bgMusic.play()

        }, { once: true })

    })

})

const correctSound = new Audio("audio/correct.wav")
const wrongSound = new Audio("audio/wrong.wav")
const placeSound = new Audio("audio/place.wav")
const clearSound = new Audio("audio/clear.wav")
const restartSound = new Audio("audio/restart.wav")
const undoSound = new Audio("audio/backforward.wav")
const redoSound = new Audio("audio/backforward.wav")

function toggleMusic() {

    musicMuted = !musicMuted

    bgMusic.muted = musicMuted

}


/* ELEMENTS */

const plots = document.querySelectorAll(".plot")
const cropContainer = document.getElementById("cropContainer")
const roundText = document.getElementById("round")
const scoreText = document.getElementById("score")
const celebration = document.getElementById("celebration")
const celebration1 = document.getElementById("celebration1")
const badgeBox = document.getElementById("badgeBox")
const badgeText = document.getElementById("badgeText")
const tractor = document.getElementById("tractor")

let isDay = true

const rotationPatterns = [

    ["deep", "legume", "cereal", "shallow"],
    ["legume", "cereal", "shallow", "deep"],
    ["cereal", "shallow", "deep", "legume"],
    ["shallow", "deep", "legume", "cereal"]

]


/* VARIABLES */

let score = 0
let round = 1
let draggedCrop = null
let selectedCrop = null

let undoStack = []
let redoStack = []

let currentRotation = []

const totalRounds = 5


/* CROP GROUPS */

const cropGroups = {

    deep: [
        { icon: "🍠", name: "Cassava", id: "cassava", type: "deep" },
        { icon: "🍠", name: "Yam", id: "yam", type: "deep" },
        { icon: "🍠", name: "Sweet Potato", id: "sweetpotato", type: "deep" }
    ],

    legume: [
        { icon: "🫘", name: "Cowpea", id: "cowpea", type: "legume" },
        { icon: "🫘", name: "Groundnut", id: "groundnut", type: "legume" },
        { icon: "🫘", name: "Soybean", id: "soybean", type: "legume" }
    ],

    cereal: [
        { icon: "🌽", name: "Maize", id: "maize", type: "cereal" },
        { icon: "🌾", name: "Rice", id: "rice", type: "cereal" },
        { icon: "🌾", name: "Sorghum", id: "sorghum", type: "cereal" }
    ],

    shallow: [
        { icon: "🍅", name: "Tomato", id: "tomato", type: "shallow" },
        { icon: "🥬", name: "Lettuce", id: "lettuce", type: "shallow" },
        { icon: "🥬", name: "Cabbage", id: "cabbage", type: "shallow" }
    ]

}


const rotationTypes = ["deep", "legume", "cereal", "shallow"]


startRound()


function startRound() {

    let selected = []

    rotationTypes.forEach(type => {

        const group = cropGroups[type]

        const crop = group[Math.floor(Math.random() * group.length)]

        selected.push(crop)

    })

    currentRotation = selected.map(c => c.id)

    const shuffled = shuffle([...selected])

    cropContainer.innerHTML = ""

    shuffled.forEach(crop => {

        const div = document.createElement("div")

        div.className = "crop"
        div.draggable = true
        div.id = crop.id

        div.innerHTML = crop.icon + " " + crop.name

        div.addEventListener("dragstart", () => draggedCrop = crop.id)
        div.addEventListener("click", () => selectedCrop = crop.id)

        cropContainer.appendChild(div)

    })

    plots.forEach(plot => {
        plot.innerHTML = plot.id.toUpperCase()
        plot.dataset.crop = ""
    })

    undoStack = []
    redoStack = []

}


/* DROP (PC) */

plots.forEach(plot => {

    plot.addEventListener("dragover", e => e.preventDefault())

    plot.addEventListener("drop", () => {

        if (!draggedCrop) return

        placeCrop(plot, draggedCrop)

    })

})


/* TAP (MOBILE) */

plots.forEach(plot => {

    plot.addEventListener("click", () => {

        if (!selectedCrop) return

        placeCrop(plot, selectedCrop)

    })

})


function placeCrop(plot, crop) {

    placeSound.currentTime = 0
    placeSound.play()

    const prev = [...plots].map(p => p.dataset.crop || "")

    undoStack.push(prev)
    redoStack = []

    plot.dataset.crop = crop
    plot.innerHTML = ""

    const cropInfo = findCrop(crop)

    for (let i = 0; i < 12; i++) {

        const plant = document.createElement("div")

        plant.className = "plant"
        plant.innerHTML = cropInfo.icon

        plot.appendChild(plant)

    }

    checkGame()

}


function checkGame() {

    const filled = [...plots].every(p => p.dataset.crop)

    if (!filled) return

    /* get learner crop types */

    const learnerTypes = [...plots].map(plot => {

        const crop = findCrop(plot.dataset.crop)

        return crop.type

    })

    /* check against all rotation patterns */

    const correct = rotationPatterns.some(pattern => {

        return pattern.every((type, index) => type === learnerTypes[index])

    })


    if (correct) {

        score += 3
        scoreText.textContent = score

        correctSound.currentTime = 0
        correctSound.play().catch(()=>{})

        showCelebration()

        checkBadges()

        setTimeout(()=>{

            tractorAnimation()

        },800)

        setTimeout(nextRound,2000)

    } else {

        wrongSound.currentTime = 0
        wrongSound.play().catch(()=>{})

        showCelebration1()

        showCorrect()

    }

}




function showCorrect() {

    plots.forEach((plot, i) => {

        plot.innerHTML = ""

        const crop = findCrop(currentRotation[i])

        for (let j = 0; j < 12; j++) {

            const plant = document.createElement("div")

            plant.className = "plant"
            plant.innerHTML = crop.icon

            plot.appendChild(plant)

        }

    })

    setTimeout(nextRound, 3000)

}


function nextRound() {

    if (round < totalRounds) {

        round++
        roundText.textContent = round

        toggleDayNight()

        startRound()

    } else {

        alert("Game Over! Final Score: " + score)

    }

}

function toggleDayNight(){

if(isDay){

document.body.classList.remove("day")
document.body.classList.add("night")

}else{

document.body.classList.remove("night")
document.body.classList.add("day")

}

isDay=!isDay

}


function resetGame() {

    score = 0
    round = 1

    scoreText.textContent = 0
    roundText.textContent = 1

    startRound()

    restartSound.play();

}


function clearPlots() {

    plots.forEach(plot => {
        plot.innerHTML = plot.id.toUpperCase()
        plot.dataset.crop = ""
    })

    clearSound.play();

}


function undoMove() {
    redoSound.pause();
    redoSound.currentTime = 0;
    undoSound.pause();
    undoSound.currentTime = 0;
    if (!undoStack.length) return

    const last = undoStack.pop()

    redoStack.push([...plots].map(p => p.dataset.crop || ""))

    applyState(last)

    undoSound.play();

}


function redoMove() {
    redoSound.pause();
    redoSound.currentTime = 0;
    undoSound.pause();
    undoSound.currentTime = 0;
    if (!redoStack.length) return

    const next = redoStack.pop()

    undoStack.push([...plots].map(p => p.dataset.crop || ""))

    applyState(next)

    redoSound.play();


}


function applyState(state) {

    plots.forEach((plot, i) => {

        const crop = state[i]

        plot.dataset.crop = crop
        plot.innerHTML = ""

        if (crop) {

            const cropInfo = findCrop(crop)

            for (let j = 0; j < 12; j++) {

                const plant = document.createElement("div")

                plant.className = "plant"
                plant.innerHTML = cropInfo.icon

                plot.appendChild(plant)

            }

        } else {

            plot.innerHTML = plot.id.toUpperCase()

        }

    })

}


function findCrop(id) {

    for (const group in cropGroups) {

        for (const crop of cropGroups[group]) {

            if (crop.id === id) return crop

        }

    }

}


function shuffle(arr) {

    return arr.sort(() => Math.random() - .5)

}

function showCelebration(){

celebration.classList.remove("hidden")

setTimeout(()=>{

celebration.classList.add("hidden")

},1800)

}

function showCelebration1(){

celebration1.classList.remove("hidden")

setTimeout(()=>{

celebration1.classList.add("hidden")

},900)

}


function tractorAnimation(){

tractor.classList.remove("hidden")

setTimeout(()=>{

tractor.classList.add("hidden")

},4000)

}


function checkBadges(){

if(score===9){

showBadge("🌱 Beginner Farmer")

}

if(score===18){

showBadge("🌾 Skilled Rotator")

}

if(score===30){

showBadge("👨‍🌾 Master Farmer")

}

}


function showBadge(text){

badgeText.innerText=text

badgeBox.classList.remove("hidden")

setTimeout(()=>{

badgeBox.classList.add("hidden")

},3000)

}