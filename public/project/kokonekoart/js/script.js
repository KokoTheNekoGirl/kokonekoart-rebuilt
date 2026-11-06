var signAnimation = bodymovin.loadAnimation({
    container: document.querySelector('#signAnimation'), // Required
    path: 'js/json/asset1-data.json', // Required
    renderer: 'svg', // Required
    loop: true, // Optional
    autoplay: true, // Optional
    rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
      },
})
var phoneAnimation = bodymovin.loadAnimation({
    container: document.querySelector('#phoneAnimation'), // Required
    path: 'js/json/asset2-data.json', // Required
    renderer: 'svg', // Required
    loop: true, // Optional
    autoplay: true, // Optional
    rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
      },
})

new fullpage('#fullPage', {
    scrollbar: false,
    lazyLoading: true,
    autoScrolling: true,
    responsiveWidth: 1000, // below this, normal scrolling (see the mobile block in style.scss)
    navigation: true,
    slidesNavigation: true,
    controlArrows: false,
    menu: '#site-header',
    anchors: ['Home','Prices', 'Gallery', 'Contact'],
    normalScrollElements: '#normalscroll',
    onLeave: function(){
        document.querySelectorAll('.section[data-aos]').forEach(function(section){
            section.classList.remove("aos-animate");

        });
        document.querySelectorAll('.anim-box').forEach(function(detail){
            console.log("animated out", detail.id);
            // Stop the animation for the corresponding container
            switch (detail.id) {
              case "signAnimation":
                signAnimation.stop();
                break;
              case "phoneAnimation":
                phoneAnimation.stop();
                break;
            }
        });
    },
    // onSlideLeave: function(){
    //     document.querySelectorAll('.slide [data-aos]').forEach(function(this){
    //         this.classList.remove("aos-animate")
    //     });
    // },
    // afterSlideLoad: function(){
    //     document.querySelectorAll('.slide.active [data-aos]').forEach(function(this){
    //         this.classList.add("aos-animate")
    //     });
    // },
    afterLoad: function(){
        document.querySelectorAll('.active[data-aos]').forEach(function(section){
            console.log(section);
            section.classList.add("aos-animate");
        });
        document.querySelectorAll('.anim-box').forEach(function(detail){
            console.log("animated in", detail.id);
            // Start the animation for the corresponding container
            switch (detail.id) {
              case "signAnimation":
                signAnimation.playSegments(
                  [
                    [0, 15],
                    [15, 49],
                  ],
                  true
                );
                break;
              case "phoneAnimation":
                phoneAnimation.playSegments(
                  [
                    [0, 24],
                    [24, 71],
                  ],
                  true
                );
                break;
            }
        });
    }
})

const artwork_worth = [
    [2.00,3.00,4.00,3.00],
    [1.00,2.00,4.00,6.00],
    [1.00,1.00,2.00,3.00]
];

const artwork_name = [
    ['HS','HB','FB','chibi'],
    ['sketch','lines','color','shaded'],
    ['trans','bg-color','pattern','scene']
]

let comm_btns = document.querySelectorAll('.comm-btn');

let art_container = document.querySelector('#sample-img');
let art_sample = art_container.querySelector('#sample-art');
let btn_lock = document.querySelector('.prices-container');

let price_tag =  document.querySelector('.price-tag').querySelector('#price');
let current_price = price_tag.innerHTML;

for(var i = 0; i<comm_btns.length;i++){
    let custom_btn = comm_btns[i].querySelectorAll('.custom-btn');
    custom_btn.forEach(function(element) {
        
        element.addEventListener("click", function(self){
            if(btn_lock.getAttribute('data-locked')!='true'){
                btn_lock.setAttribute('data-locked','true');
                let prev_btn = element.parentElement.querySelector('.selected');
                if(prev_btn!=null&&prev_btn.getAttribute('id')!=element.id){
                    prev_btn.classList.remove('selected');
                    element.classList.add('selected');
                    art_price_calc(prev_btn)
                }
                else if(prev_btn==null){
                    element.classList.add('selected');
                    art_price_calc(prev_btn)
                }
                setTimeout(() => {
                    btn_lock.setAttribute('data-locked','false');
                }, 1000);
            }
        });
    });
}

let intervalId;
let incrementSpeed = 25; // Initial speed, adjust as needed
let iteration = 0;
const maxIterations =100; // Adjust as needed

function art_price_calc(prev_btn) {
    const price = find_selected_btns(prev_btn);

    // Clear previous interval to avoid conflicts
    clearInterval(intervalId);

    // Calculate the difference between the new price and the current price
    const priceDifference = price - parseFloat(current_price);

    // Determine the direction of change (increment or decrement)
    const direction = priceDifference >= 0 ? 1 : -1;

    // Start the interval to update the price continuously
    intervalId = setInterval(function () {
        iteration++;

        // Use a quadratic ease-in function
        const easeFactor = Math.pow(iteration / maxIterations, 2);

        // Calculate the adjusted speed
        const adjustedSpeed = incrementSpeed * easeFactor;

        current_price = (parseFloat(current_price) + direction * adjustedSpeed).toFixed(2); // Keep two decimal places
        price_tag.innerHTML = current_price;

        // Stop the interval when the target price is reached
        if ((direction === 1 && current_price >= price) || (direction === -1 && current_price <= price)) {
            price_tag.innerHTML = price+".00";
            clearInterval(intervalId);
            iteration = 0; // Reset iteration for the next interval
        }
    }, incrementSpeed);
}

let prev_shot = '';
let paper_bg = document.querySelector('#sample-bg');
function find_selected_btns(prev_btn){
    let price = 0;
    art_sample.style.opacity = '0';
    console.log(paper_bg);
    for(var i = 0; i<comm_btns.length;i++){

        let custom_btn = comm_btns[i].querySelectorAll('.custom-btn');

        for(var p = 0; p<custom_btn.length;p++){
            if(custom_btn[p].classList.contains('selected')){
                price += artwork_worth[i][p];
                if(i==0){
                    let shot_class = artwork_name[0][p];
                    let shot_id = custom_btn[p].getAttribute('id');
                    let shot_bg = document.querySelector('[data-bg-id="'+shot_id+'"]');
                    let diff = 0;
                    setTimeout(() => {
                        art_container.className = shot_class;
                    }, 500);
                    if(prev_shot==''){
                        prev_shot = shot_bg;
                    }
                    if(prev_btn!=null&&prev_btn.classList.contains('char-btn')){

                        if(custom_btn[p].getAttribute('id')==3||prev_btn.getAttribute('id')==3){

                            if(prev_btn.getAttribute('id') < shot_id){
                                paper_bg.classList.add('flip-forward');
                                setTimeout(() => {
                                    paper_bg.classList.remove('flip-forward');
                                }, 1000);
                            }
                            else{
                                paper_bg.classList.add('flip-backward');
                                setTimeout(() => {
                                    paper_bg.classList.remove('flip-backward');
                                }, 1000);
                            }
                        }
                        else if(prev_btn.getAttribute('id') < shot_id){
                            diff = shot_id - prev_btn.getAttribute('id');
                            if(diff==1){
                                shot_bg.classList.add('fold-forward');
                                setTimeout(() => {
                                    shot_bg.classList.remove('fold-forward');
                                }, 500);
                            }
                            else {
                                document.querySelector('.halfbody-bg').classList.add('fold-forward');
                                setTimeout(() => {
                                    document.querySelector('.fullbody-bg').classList.add('fold-forward');
                                }, 250);
                                setTimeout(() => {
                                    document.querySelector('.halfbody-bg').classList.remove('fold-forward');
                                    document.querySelector('.fullbody-bg').classList.remove('fold-forward');
                                }, 500);
                            }
                            
                        }
                        else if(prev_btn.getAttribute('id') > shot_id){
                            diff = prev_btn.getAttribute('id') - shot_id;
                            if(diff==1){
                                prev_shot.classList.add('fold-backward');
                                setTimeout(() => {
                                    prev_shot.classList.remove('fold-backward');
                                }, 500);
                            }
                            else {
                                document.querySelector('.fullbody-bg').classList.add('fold-backward');
                                setTimeout(() => {
                                    document.querySelector('.halfbody-bg').classList.add('fold-backward');
                                }, 250);
                                setTimeout(() => {
                                    document.querySelector('.halfbody-bg').classList.remove('fold-backward');
                                    document.querySelector('.fullbody-bg').classList.remove('fold-backward');
                                }, 500);
                            }
                        }
                        prev_shot = shot_bg;
                    }
                }
                if(i==1){
                    let art_class = artwork_name[1][p];
                    setTimeout(() => {
                        art_sample.className = art_class;
                    }, 500);
                }
                if(i==2){
                    let bg_class = artwork_name[2][p];
                    setTimeout(() => {
                        paper_bg.setAttribute('class','animatable');
                        paper_bg.classList.add(bg_class);
                        art_sample.style.opacity = '100';
                    }, 750);
                }
            }
        }
    }

    return price;
}