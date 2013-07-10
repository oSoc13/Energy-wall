$('document').ready(init);

dataElDefaultHeight = 224;
templatesUrl = 'assets/templates/';

//Status
isOpen = false;
currentOpenedEl = '';

//presentation vars
currentSelected = 'gas';
dataEls = [];
closeTimer = 0;
secondsPassed = 0;
secondsUntilClose = 5;

//loading data elements
firstLoadEls = true;
numElementsToGenerate = 0;
lastElementAdded = '';
numGeneratedEls = 0;

gasHtml = '';
electricityHtml = '';

//rotation vars
timer = 0;
elToRotate = '';
step = 0;
total = 0;

function init()
{
    console.log('Initialise');

    //header hover
    $('#header_content').on('click',goToSite).on('mouseenter',hoverOverHeader).on('mouseleave',hoverOutHeader);

    //generate order list
    getHtmlDataForPresentationItems();
    $(window).resize(function() {
        generateOrderList(false);
    });
}

function goToSite(e){
    window.open("https://www.essent.be/nl");
}

function hoverOverHeader(e){
    $(this).unbind();
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
    $(this).unbind();
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

function getHtmlDataForPresentationItems(){
    if(gasHtml != '' && electricityHtml != ''){
        generateOrderList(false);
    } else {
        var gasUrl = templatesUrl+'gas.html';
        var electricityUrl = templatesUrl+'electricity.html';
        $.ajax({
            type:'GET',
            url:gasUrl,
            success: function(gashtml){
                gasHtml = gashtml;
                $.ajax({
                    type:'GET',
                    url:electricityUrl,
                    success: function(electricityhtml){
                        electricityHtml = electricityhtml;
                        generateOrderList(false);
                    }
                });
            }
        });
    }
}

function generateOrderList(makeExtraElement){
    numElementsToGenerate = Math.ceil(($(window).height() - $('header').height())/dataElDefaultHeight)-numGeneratedEls;
    if(numElementsToGenerate == 1 && firstLoadEls){
        numElementsToGenerate++;
        firstLoadEls = false;
    }
    if(makeExtraElement){
        numElementsToGenerate = 1;
    }
    if(numElementsToGenerate > 0){
        numGeneratedEls = numGeneratedEls + numElementsToGenerate;
        for(var i = 1; i<=numElementsToGenerate; i++){
            if(lastElementAdded == '' || lastElementAdded == 'electricity'){
                $('#data_elements').append(gasHtml);
                dataEls.push(gasHtml);
                lastElementAdded = 'gas';
            }else{
                $('#data_elements').append(electricityHtml);
                dataEls.push(electricityHtml);
                lastElementAdded = 'electricity';
            }
        }
    }
    if(numElementsToGenerate > 0){
        if(makeExtraElement){
            console.log('generate extra -> update num of data els: '+($('.gas').length+$('.electricity').length)-1);
        }else{
            console.log('num of data els: '+($('.gas').length+$('.electricity').length));
        }
    }
    //reposition open buttons
    $('.status_el').css('margin-left', $(window).width()/2-$('.status_el').width()/2);

    //hover + click progress
    if(!isOpen){
        $('.gas').unbind().on('mouseenter',hoverOverGas).on('mouseleave', hoverOutGas).on('click', selectOpenGasElement);
        $('.electricity').unbind().on('mouseenter',hoverOverElectricity).on('mouseleave', hoverOutElectricity);
    }
}

//Gas default hover
function hoverOverGas(e){
    $(this).find('div').first().css('background',"url(assets/gas/flameshover.png) no-repeat, url(assets/textures/gashover.jpg) repeat")
        .css('background-position','50% 100%, 0px 0px');
    $(this).find('div').last().css('background-image', "url(assets/gas/statusbgh.png)").html('<img src="assets/gas/statuselh.png" alt="open/close button"/>')
        .prev().find('div').first().css('background-color','#611204');

}

function hoverOutGas(e){
    $(this).find('div').first().css('background',"url(assets/gas/flames.png) no-repeat, url(assets/textures/gas.jpg) repeat").css('background-position','50% 100%, 0px 0px');
    $(this).find('div').last().css('background-image', "url(assets/gas/statusbg.png)").html('<img src="assets/gas/statusel.png" alt="open/close button"/>')
        .prev().find('div').first().css('background-color','#821C00');
}

//Gas states while open
function hoverOverGasWhileOpen(e){
    currentOpenedEl.find('div').last().rotate(180, false);
    currentOpenedEl.find('div').last().css('background-image', "url(assets/gas/statusbgh.png)").prepend('<img src="assets/gas/statuselh.png" alt="open/close button"/>').find('h4').remove().parent()
            .prev().find('div').first().css('background-color','#611204');
}

function hoverOutGasWhileOpen(e){
    currentOpenedEl.find('div').last().rotate(0, false);
    currentOpenedEl.find('div').last().css('background-image', "url(assets/gas/statusbg.png)").append('<h4 id="timergas" class="timer">'+(secondsUntilClose-secondsPassed)+'</h4>').find('img').remove();
    currentOpenedEl.find('div').first().css('background-color','#821C00');
}

//Electricity default hover
function hoverOverElectricity(e){
    $(this).find('div').first().css('background',"url(assets/electricity/thunderstruck.png) no-repeat, url(assets/textures/electricityhover.jpg) repeat")
            .css('background-position','50% 100%, 0px 0px');
}

function hoverOutElectricity(e){
    $(this).find('div').first().css('background',"url(assets/electricity/thunderstruck.png) no-repeat, url(assets/textures/electricity.jpg) repeat")
            .css('background-position','50% 100%, 0px 0px');
}

//Electricity states while open
function hoverOverElectricityWhileOpen(e){
    currentOpenedEl.find('div').last().rotate(180, false);
    currentOpenedEl.find('div').last().css('background-image', "url(assets/electricity/statusbgh.png)").prepend('<img src="assets/electricity/statuselh.png" alt="open/close button"/>').find('h4').remove().parent()
            .prev().find('div').first().css('background-color','#611204');
}

function hoverOutElectricityWhileOpen(e){
    currentOpenedEl.find('div').last().rotate(0, false);
    currentOpenedEl.find('div').last().css('background-image', "url(assets/electricity/statusbg.png)").append('<h4 id="timerelectricity" class="timer">'+(secondsUntilClose-secondsPassed)+'</h4>').find('img').remove();
    currentOpenedEl.find('div').first().css('background-color','#821C00');
}

//General click close
function clickWhileOpen(e){
    currentOpenedEl.find('div').first().next().find('div').first().stop().animate({
           width: '100%',
           marginLeft: '0%'
    },500);
    closeDataEl();
}

function selectOpenGasElement(e){
    currentSelected = 'gas';
    currentOpenedEl = $(this);
    isOpen = true;
    openElement();
}

function selectOpenElectricityElement(e){
    currentSelected = 'electricity';
    currentOpenedEl = $(this);
    isOpen = true;
    openElement();
}

function openElement(){
    secondsPassed = 0;
    currentOpenedEl.unbind().animate({
        height: '915'
    }, 500).find('div').first().animate({
        height: '834',
        'background-position-y': '100%',
        'background-position-x': '50%'
    }, 500, function(e){
            if(currentSelected == 'gas'){
                currentOpenedEl.find('div').last().on('mouseenter', hoverOverGasWhileOpen).on('mouseleave', hoverOutGasWhileOpen).on('click',clickWhileOpen).prev().on('mouseenter', hoverOverGasWhileOpen).on('mouseleave', hoverOutGasWhileOpen).on('click',clickWhileOpen);
            }else{
                currentOpenedEl.find('div').last().on('mouseenter', hoverOverElectricityWhileOpen).on('mouseleave', hoverOutElectricityWhileOpen).on('click',clickWhileOpen).prev().on('mouseenter', hoverOverElectricityWhileOpen).on('mouseleave', hoverOutElectricityWhileOpen).on('click',clickWhileOpen);
            }
    }).css('cursor', 'default');

    closeTimer = setInterval(updateCloseTimer, 1000);
    currentOpenedEl.find('div').first().next().find('div').first().animate({
       width: '2%',
       marginLeft: '49%'
    },secondsUntilClose*1000,'linear');

    if(currentSelected == 'gas'){
        openGasElement();
    }else{
        openElectricityElement();
    }
}

function openGasElement(){
    console.log('open gas element');
    currentOpenedEl.find('div').first().css('background',"url(assets/gas/flames.png) no-repeat, url(assets/textures/gas.jpg) repeat").css('background-position','50%px 100%, 0px 0px');
    currentOpenedEl.find('div').last().find('img').addClass('hide').parent().append('<h4 id="timergas" class="timer">'+secondsUntilClose+'</h4>');
}

function openElectricityElement(){
    console.log('open electricity element');
    currentOpenedEl.find('div').first().css('background',"url(assets/electricity/thunderstruck.png) no-repeat, url(assets/textures/electricity.jpg) repeat").css('background-position','50% 100%, 0px 0px');
    currentOpenedEl.find('div').last().find('img').addClass('hide').parent().append('<h4 id="timerelectricity" class="timer">'+secondsUntilClose+'</h4>');
}

function updateCloseTimer(){
    secondsPassed++;
    $('.timer').html(secondsUntilClose-secondsPassed);
    if(secondsPassed == secondsUntilClose){
        closeDataEl();
    }
}

function closeDataEl(){
    console.log('closeDataEl');
    clearInterval(closeTimer);
    currentOpenedEl.find('div').last().unbind().prev().unbind();
    currentOpenedEl.find('div').last().rotate(0, false);
    currentOpenedEl.find('div').last().find('img').removeClass('hide').next().remove();
    currentOpenedEl.animate({
            height: '224'
    }, 500).find('div').first().animate({
            height: '143',
            'background-position-y': '100%'
    }, 500, function(e){
        $('gas').unbind().on('mouseenter',hoverOverGas).on('mouseleave', hoverOutGas).on('click', selectOpenGasElement);
        $('electricity').unbind().on('mouseenter',hoverOverGas).on('mouseleave', hoverOutGas).on('click', selectOpenGasElement);

        //reset
        currentOpenedEl = '';
        isOpen = false;

        //show next
        /*$('#data_elements section').first().find('div').last().prev().find('div').first().remove();
        $('#data_elements section').first().find('div').last().animate({
            opacity: 0
        });*/

        generateOrderList(true);
        newPosition = -(dataElDefaultHeight-$('header').height());
        $('#data_elements').first().animate({
            marginTop:newPosition
        }, 500, function(e){
            $('#data_elements').css('margin-top', $('header').height()).find('section').first().remove();
            openNextEl();
        });
    }).css('cursor', 'pointer');
}

function openNextEl(){
    if(currentSelected == 'gas'){
        currentSelected = 'electricity';
    }else{
        currentSelected = 'gas';
    }
    currentOpenedEl = $('#data_elements').find('section').first();
    isOpen = true;
    openElement();
}

//Rotate additional function
jQuery.fn.rotate= function(degrees, animated) {
    if(!animated){
        $(this).css({'-webkit-transform' : 'rotate('+ degrees +'deg)',
                 '-moz-transform' : 'rotate('+ degrees +'deg)',
                 '-ms-transform' : 'rotate('+ degrees +'deg)',
                 'transform' : 'rotate('+ degrees +'deg)'});
    }else{
        elToRotate = $(this);
        step = 1;
        total = degrees;
        timer = setInterval(rotate,1);
    }
};

function rotate(){
    if(step != total){
        elToRotate.css({'-webkit-transform' : 'rotate('+ step +'deg)',
                     '-moz-transform' : 'rotate('+ step +'deg)',
                     '-ms-transform' : 'rotate('+ step +'deg)',
                     'transform' : 'rotate('+ step +'deg)'});
        step++;
    }else{
        clearInterval(timer);
    }
}