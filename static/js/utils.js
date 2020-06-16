function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateCounter(name, value) {
    $({ counter: 0 }).animate({ counter: value }, {
        duration: 1500,
        easing: 'swing', // can be anything
        step: function() { // called on every step
            // Update the element's text with rounded-up value:
            $(name).text(numberWithCommas(Math.round(this.counter)));
        }
    });
}

function randomColor() {
    return Math.floor(Math.random()*16777215).toString(16);
}

function getTodaysDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    today = `${yyyy}-${mm}-${dd}`;
    return today;
}