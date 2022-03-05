$(document).ready(function () {
    var fullHeight = function () {
        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function () {
            $('.js-fullheight').css('height', $(window).height());
        });
    };
    fullHeight();
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
    ($(window).width() < 992) ? $('#body').addClass('flex-column-reverse') : $('#body').addClass('flex-row');
});

$(window).on('resize', function () {
    var win = $(this);
    if (win.width() < 992) {
        $('#body').removeClass('flex-row');
        $('#body').addClass('flex-column-reverse');
    } else {
        $('#body').removeClass('flex-column-reverse');
        $('#body').addClass('flex-row');
    }
});