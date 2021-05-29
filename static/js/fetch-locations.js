function fetchLocations(guildId, userId, resultCallback) {
    $.ajax({
        url: `/api/server/${guildId}/user/${userId}?type=locations`,
        async: true,
        type: 'POST',
        success: resultCallback,
    });
}