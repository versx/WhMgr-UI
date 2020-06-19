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
$('#select_gen1').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (item.id < 152) {
            selectItem(item);
        }
    });
});
$('#select_gen2').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (item.id > 151 && item.id < 252) {
            selectItem(item);
        }
    });
});
$('#select_gen3').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (item.id > 251 && item.id < 387) {
            selectItem(item);
        }
    });
});
$('#select_gen4').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (item.id > 386 && item.id < 495) {
            selectItem(item);
        }
    });
});
$('#select_gen5').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (item.id > 494 && item.id < 650) {
            selectItem(item);
        }
    });
});
$('#select_rare').on('click', function() {
    const commonList = [
        1,4,10,11,13,14,16,17,19,20,21,22,25,23,27,29,30,32,33,37,39,43,46,47,48,49,50,51,52,56,54,58,60,72,74,77,79,84,88,90,96,102,104,109,112,116,126,127,128,133,138,140,
        152,155,161,163,165,167,170,177,179,183,187,190,191,193,200,198,194,209,215,216,218,220,223,226,228,231,
        252,255,261,263,265,270,273,276,277,285,287,293,296,299,300,302,304,307,309,311,312,314,315,316,318,322,325,328,331,333,336,339,341,343,345,347,351,353,355,361,363,370,
        387,390,396,399,401,412,418,421,427,431,434,451,453,459,
        495,498,504,506,509,519,524,543,572,590
    ];
    $.each($('.item'), function(index, item) {
        if (!commonList.includes(parseInt(item.id))) {
            selectItem(item);
        }
    });
});
$('#select_ultra').on('click', function() {
    const ultraList = [
        482,201,176,554,610,564,535,131,633,290,531,595,204,594,622,358,566,597,618,631,443,132,562,374,634,372,375
    ];
    $.each($('.item'), function(index, item) {
        if (ultraList.includes(parseInt(item.id))) {
            selectItem(item);
        }
    });
})
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