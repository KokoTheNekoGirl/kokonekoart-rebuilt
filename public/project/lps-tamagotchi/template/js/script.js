//Variables
//sounds
var music = new Audio("template/sfx/music.mp3");
var sound = new Audio("template/sfx/button.wav");
var clicked = new Audio("template/sfx/clicked.wav");
var success = new Audio("template/sfx/squeak.wav");
var error = new Audio("template/sfx/error.wav");
var complete = new Audio("template/sfx/complete.wav");
//buttons
var feed = document.querySelector(".feed");
var pet = document.querySelector(".pet");
var load = document.querySelector(".loading-bar");
var loading = document.querySelector('.loading-bar-load');
var reset = document.querySelector(".reset");
//objects
var div = document.querySelector('.container')
var hand = document.querySelector(".hand");
var bunny = document.querySelector(".bunny");
var heart = document.querySelector(".heart");
//other
var successState= 0;
var color = "";

//Session stats (replaces health-stats.php). Lives in this browser tab's sessionStorage and
//is cleared when the tab is closed. hunger/social go up 25 per action (max 100);
//blue/pink count how many times each button colour was pressed.
var STATS_KEY = "lps-tamagotchi-stats";
var SESSION_MS = 25 * 60 * 1000;
var FULL = 100;

function loadStats() {
    var stats = {hunger: 0, social: 0, blue: 0, pink: 0, updatedAt: 0};
    try {
        var saved = JSON.parse(sessionStorage.getItem(STATS_KEY));
        if (saved && Date.now() - saved.updatedAt >= SESSION_MS) {
            sessionStorage.removeItem(STATS_KEY); //expired: start fresh
        }
        else if (saved) {
            stats.hunger = saved.hunger || 0;
            stats.social = saved.social || 0;
            stats.blue = saved.blue || 0;
            stats.pink = saved.pink || 0;
            stats.updatedAt = saved.updatedAt;
        }
    } catch (e) {}
    return stats;
}

function saveStats(stats) {
    stats.updatedAt = Date.now();
    try {
        sessionStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {}
}


var message = document.querySelector(".game-message");

function isComplete(stats) {
    return stats.hunger >= FULL && stats.social >= FULL;
}

function lock(btn, locked) {
    btn.classList.toggle("enabled", !locked);
    btn.classList.toggle("locked", locked);
}

function applyLocks() {
    var stats = loadStats();
    lock(feed, stats.hunger >= FULL);
    lock(pet, stats.social >= FULL);
    return stats;
}

function showSatisfied(text) {
    feed.style.display = "none";
    pet.style.display = "none";
    reset.style.display = "none";
    reset.innerHTML = "";
    message.textContent = text;
    message.hidden = false;
}

//Functions
window.onload = function(){
    //on load, plays music. loops music once ended.
    music.play();

    music.addEventListener('ended', function() {
        this.currentTime = 0;
        this.play();
    }, false);
};


//on page load
if (isComplete(applyLocks())) {
    showSatisfied("Bunny is satisfied. Come play again later!");
    heart.style.display = "block";
    complete.play();
}

//A/B test: one of the two buttons is blue at random, the other stays pink (replaces PHP rand()).
//This re-rolls on every page load, like the PHP version did.
(Math.random() < 0.5 ? feed : pet).classList.add("blue");

function btnSound(btn) {
    //hover sound, only on enabled buttons
    if (btn && !btn.classList.contains("enabled")) return;
    sound.play();
}

function successSound() {
    //squeaking sound
    setTimeout(function(){
        success.play();
    }, 725)
    
}

function interact(this_element,id) {

    if (this_element.classList.contains("locked")) {
        error.play();
        return;
    }

    var food = document.querySelector(".food");

    //updating to button state 2
    feed.style.display='none';
    pet.style.display='none';
    clicked.play();
    load.style.display='block';
    loading.style.width = "0%";

    setTimeout(function(){
        loading.style.width= "25%";
    }, 100)    

    setTimeout(function(){
        loading.style.width= "50%";
    }, 500)    
    setTimeout(function(){
        loading.style.width= "75%";
    }, 1000)    
    setTimeout(function(){
        loading.style.width= "100%";
    }, 1500)    

    //updating readying states of objects
    if (id==1) {
        food.classList.replace("empty","filling");
    }
    else if (id==2) {
        hand.style.opacity = "100";
        food.style.opacity = "0"
    }
    else {
        return
    }

    // A/B tracking
    if (this_element.classList.contains('blue')) {
        color="blue";
    }
    else {
        color="pink";
    }

    //record the action in this browser session (no server needed)
    var stats = loadStats();
    if (id==1) {
        stats.hunger = Math.min(100, stats.hunger + 25);
    }
    else {
        stats.social = Math.min(100, stats.social + 25);
    }
    stats[color]++;
    saveStats(stats);

    //pause for dramatic effect
    setTimeout(function(){
        //senses if button pressed was/wans't blue and makes the reset button the same colour.
        if (color=="blue") {
            reset.classList.add("blue");
            console.log("User pressed the blue button", stats);
        }

        else {
            reset.classList.remove("blue");
            console.log("User pressed the pink button", stats);
            
        }

        //ID 1 = feeding the bunny, ID 2 = petting the bunny
        if (id==1) {
            
            food.classList.replace("filling","filled");
            
            bunny.classList.replace("idle",'feed-success');
        }
        else if (id==2){
            bunny.classList.replace("idle",'pet-success');
            hand.style.opacity = "0";
        }

        //rest of the success updates
        successState++;
        successSound();

        //updates to 3rd and final state
       loading.style.width = "0%";
       load.style.display='none';
       if (isComplete(stats)) {
            showSatisfied("Game complete! Bunny is satisfied.");
            complete.play();
            heart.style.display = "block";
       }
       else if ((id==1 && stats.hunger >= FULL) || (id==2 && stats.social >= FULL)) {
            complete.play();
            heart.style.display = "block";
            reset.innerHTML = "Play again?";
            reset.style.display = "block";
       }
       else {
        reset.innerHTML = "Play again?";
        reset.style.display = "block";
       }
    }, 2000)

}

function resetGame(){
    var food = document.querySelector(".food");
    //resetting the game back to ground 0
    success.pause();
    success.currentTime = 0;
    successState = 0;
    feed.style.display='block';
    pet.style.display='block';
    applyLocks();
    heart.style.display = "none";
    reset.style.display = "none";
    reset.innerHTML = "";
    bunny.classList.remove("pet-success"); 
    bunny.classList.remove("feed-success");
    bunny.classList.add("idle");
    food.classList.add('empty');
    food.classList.remove('filled')
    food.style.opacity = "100"
    //location.reload(); 
}

//success sound loop
success.addEventListener('ended', function() {
    //this helps stop the sound if the success is not active
    if (successState>0) {
        this.currentTime = 0;
        successSound();
    }
    //exits once false
    else {
        return
    }
}, false);

