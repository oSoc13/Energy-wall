$('document').ready(init);

function init()
{
    console.log('Initialise');
    $('#header_content').on('click',goToSite).on('mouseenter',hoverOverHeader).on('mouseleave',hoverOutHeader);
    $('.status_el').css('margin-left', $(window).width()/2-$('.status_el').width()/2);
}

function goToSite(e){
    window.open("https://www.essent.be/nl");
}

function hoverOverHeader(e){
    $('#header_content').unbind();
    $(this).find('img').animate({
        opacity: .5
    }, 200);
    $(this).find('h2').fadeOut('fast', function(e){
        $(this).addClass('hide');
        $('#be').fadeIn('fast', function(e){
            $('#header_content').on('click',goToSite).on('mouseenter',hoverOverHeader).on('mouseleave',hoverOutHeader);
        });
    });
}

function hoverOutHeader(e){
    $('#header_content').unbind();
    currentEl = $(this);
    $(this).find('img').animate({
        opacity: 1
    }, 200);
    $('#be').fadeOut('fast', function(e){
        $(this).addClass('hide');
        currentEl.find('h2').removeClass('hide').fadeIn('fast', function(e){
            $('#header_content').on('click',goToSite).on('mouseenter',hoverOverHeader).on('mouseleave',hoverOutHeader);
        });
    });
}