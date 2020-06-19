$('#select_all').on('click', function() {
    $.each($('.item'), function(index, item) {
        selectItem(item);
    });
});
$('#select_none').on('click', function() {
    $.each($('.item'), function(index, item) {
        unselectItem(item);
        $('#pokemon').val('');
    });
});
function onPokemonClicked(element) {
    if (element.classList.value.includes('active')) {
        element.classList.value = element.classList.value.replace(' active', '');
        element.style.background = $('.pokemon-list').css('background-color');
        removeId(element.id);
    } else {
        element.classList.value = element.classList.value += ' active';
        element.style.background = 'dodgerblue';
        appendId(element.id);
    }
}
function selectItem(element) {
    if (!element.classList.value.includes('active')) {
        element.classList.value = element.classList.value += ' active';
    }
    element.style.background = 'dodgerblue';
    appendId(element.id);
}
function unselectItem(element) {
    if (element.classList.value.includes('active')) {
        element.classList.value = element.classList.value.replace(' active', '');
    }
    element.style.background = $('.pokemon-list').css('background-color');
    removeId(element.id);
}
function appendId(id) {
    const value = $('#pokemon').val();
    if (value === '') {
        $('#pokemon').val(id);
    } else {
        if (!(value || '').split(',').includes(id)) {
            if (value.endsWith(',')) {
                $('#pokemon').val(value + id);
            } else {
                $('#pokemon').val(value + ',' + id);
            }
        }
    }
}
function removeId(id) {
    const value = $('#pokemon').val();
    $('#pokemon').val(value.replace(id + ',', '').replace(id, ''));
}