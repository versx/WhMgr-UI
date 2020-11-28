function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function updateCounter(name, value) {
    $({ counter: 0 }).animate({ counter: value }, {
        duration: 1000,
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

function onServerChanged() {
    const guildId = $("#server_selector").val();
    if (guildId) {
        set('guild_id', guildId);
        // Show hidden nav pages since guild/server is selected
        $('.nav-pages').prop('hidden', false);
        try {
            $('#guild_id').val(guildId);
            refreshData();
            location.reload();
        } catch { }
    }
}
function showError(message) {
    if ($('#server_selector').val() === null) {
        $('#error').html(`<strong>Error!</strong> ${message}`);
        $('.alert').removeClass('d-none');
    }
}