$('.save').on('click', event => {
    let id = $(event.target).data('id');
    $.ajax({
        method: 'POST',
        url: '/articles/' + id,
    }).then(() => {
        location.reload();
    });
});