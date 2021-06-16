let pokemonRarity = {};
$.getJSON('/data/rarity.json', function(data) {
    pokemonRarity = data;
});

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
$('#select_gen6').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (item.id > 649 && item.id < 722) {
            selectItem(item);
        }
    });
});
$('#select_rare').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (!pokemonRarity.common.includes(parseInt(item.id))) {
            selectItem(item);
        }
    });
});
$('#select_ultra').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (pokemonRarity.ultra.includes(parseInt(item.id))) {
            selectItem(item);
        }
    });
});
$('#select_raid5star').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (pokemonRarity.raid5star.includes(parseInt(item.id))) {
            selectItem(item);
        }
    });
});
$('#select_invert').on('click', function() {
    $.each($('.item'), function(index, item) {
        if (!item.classList.value.includes('active')) {
            selectItem(item);
        } else {
            unselectItem(item);
        }
    });
});

function onPokemonClicked(element) {
    if (element.disabled)
        return;
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

function onPokemonSearch() {
    const pokemon = $('#pokemon-list').children();
    const search = $('#search').val().toLowerCase();
    for (let element of pokemon) {
        const name = element.getAttribute('name');
        const id = element.getAttribute('id');
        let matches = false;
        if (search.includes(' ')) {
            matches = !search.includes(name.toLowerCase()) && !search.includes(id) && search;
        } else {
            matches = !name.toLowerCase().includes(search) && !id.includes(search) && search;
        }
        element.hidden = matches;
    }
}

function toggleAllPokemon(disable) {
    const pokemon = $('#pokemon-list').children();
    for (let element of pokemon) {
        element.disabled = disable;
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
