$('document').ready(init);

dataElDefaultHeight = 224;
templatesUrl = 'assets/templates/';

//Status
isPresentationModeOn = true;
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

    //header hover + click
    $('#presentation_mode_on').on('click', presModeOn);
    $('#presentation_mode_off').on('click', presModeOff);
    $('#presentation_mode').on('mouseenter', hoverOverPresentationMode).on('mouseleave', hoverOutPresentationMode);
    $('#header_content').on('click',goToSite).on('mouseenter',hoverOverHeader).on('mouseleave',hoverOutHeader);

    //generate order list
    getHtmlDataForPresentationItems();
    $(window).resize(function() {
        generateOrderList(false);
    });
}

function hoverOverPresentationMode(e){
    $(this).stop().animate({
        marginLeft: 0
    }, 500);
}

function hoverOutPresentationMode(e){
    $(this).stop().animate({
        marginLeft: -295
    }, 500);
}

function presModeOn(e){
    e.preventDefault();
    $(this).addClass('selected');
    $(this).next().removeClass('selected');
    isPresentationModeOn = true;
    if(isOpen){
        secondsPassed = 0;
        closeTimer = setInterval(updateCloseTimer, 1000);
        currentOpenedEl.find('div').first().next().find('div').first().animate({
           width: '2%',
           marginLeft: '49%'
        },secondsUntilClose*1000,'linear');
        currentOpenedEl.find('div').last().rotate(0, false);
        currentOpenedEl.find('div').last().html('<h4 id="timergas" class="timer">'+(secondsUntilClose-secondsPassed)+'</h4>');
    }
}

function presModeOff(e){
    e.preventDefault();
    $(this).addClass('selected');
    $(this).prev().removeClass('selected');
    isPresentationModeOn = false;
    if(isOpen){
        clearInterval(closeTimer);
        currentOpenedEl.find('div').first().next().find('div').first().stop().animate({
               width: '100%',
               marginLeft: '0%'
        },500);
        if(currentSelected == 'gas'){
            currentOpenedEl.find('div').last().html('<img src="assets/gas/statusel.png" alt="open/close button"/>');
        }else{
            currentOpenedEl.find('div').last().html('<img src="assets/electricity/statusel.png" alt="open/close button"/>');
        }
        currentOpenedEl.find('div').last().rotate(180, false);
    }
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
    /*if(numElementsToGenerate > 0){
        if(makeExtraElement){
            console.log('generate extra -> update num of data els: '+($('.gas').length+$('.electricity').length)-1);
        }else{
            console.log('num of data els: '+($('.gas').length+$('.electricity').length));
        }
    }*/
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
    currentOpenedEl.find('div').last().css('background-image', "url(assets/gas/statusbgh.png)").prev().prev().css('background-color','#611204');
    if(isPresentationModeOn){
        currentOpenedEl.find('div').last().rotate(180, false);
        currentOpenedEl.find('div').last().html('<img src="assets/gas/statuselh.png" alt="open/close button"/>');
    }else{
        currentOpenedEl.find('div').last().find('img').first().attr('src','assets/gas/statuselh.png');
    }
}

function hoverOutGasWhileOpen(e){
    currentOpenedEl.find('div').last().css('background-image', "url(assets/gas/statusbg.png)");
    currentOpenedEl.find('div').first().css('background-color','#821C00');

    if(isPresentationModeOn){
        currentOpenedEl.find('div').last().rotate(0, false);
        currentOpenedEl.find('div').last().html('<h4 id="timergas" class="timer">'+(secondsUntilClose-secondsPassed)+'</h4>');
    }
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
    currentOpenedEl.find('div').last().css('background-image', "url(assets/electricity/statusbgh.png)").prev().prev().css('background-color','#611204');
    if(isPresentationModeOn){
        currentOpenedEl.find('div').last().rotate(180, false);
        currentOpenedEl.find('div').last().html('<img src="assets/electricity/statuselh.png" alt="open/close button"/>');
    }else{
        currentOpenedEl.find('div').last().find('img').first().attr('src','assets/electricity/statuselh.png');
    }
}

function hoverOutElectricityWhileOpen(e){
    currentOpenedEl.find('div').last().css('background-image', "url(assets/electricity/statusbg.png)");
    currentOpenedEl.find('div').first().css('background-color','#821C00');

    if(isPresentationModeOn){
        currentOpenedEl.find('div').last().rotate(0, false);
        currentOpenedEl.find('div').last().html('<h4 id="timerelectricity" class="timer">'+(secondsUntilClose-secondsPassed)+'</h4>');
    }
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
    console.log('open element');
    secondsPassed = 0;
    currentOpenedEl.unbind().animate({
        height: '915'
    }, 500).find('div').first().animate({
        height: '834',
        'background-position-y': '100%',
        'background-position-x': '50%'
    }, 500, function(e){
            if(currentSelected == 'gas'){
                currentOpenedEl.find('div').last().on('mouseenter', hoverOverGasWhileOpen).on('mouseleave', hoverOutGasWhileOpen).on('click',closeDataEl).prev().on('mouseenter', hoverOverGasWhileOpen).on('mouseleave', hoverOutGasWhileOpen).on('click',closeDataEl);
            }else{
                currentOpenedEl.find('div').last().on('mouseenter', hoverOverElectricityWhileOpen).on('mouseleave', hoverOutElectricityWhileOpen).on('click',closeDataEl).prev().on('mouseenter', hoverOverElectricityWhileOpen).on('mouseleave', hoverOutElectricityWhileOpen).on('click',closeDataEl);
            }
    }).css('cursor', 'default');

    //Presentation mode autoplay
    if(isPresentationModeOn){
        clearInterval(closeTimer);
        closeTimer = setInterval(updateCloseTimer, 1000);
        currentOpenedEl.find('div').first().next().find('div').first().animate({
           width: '2%',
           marginLeft: '49%'
        },secondsUntilClose*1000,'linear');
    }

    if(currentSelected == 'gas'){
        openGasElement();
    }else{
        openElectricityElement();
    }
}

function openGasElement(){
    console.log('open gas element');
    currentOpenedEl.find('div').first().css('background',"url(assets/gas/flames.png) no-repeat, url(assets/textures/gas.jpg) repeat").css('background-position','50%px 100%, 0px 0px');
    if(isPresentationModeOn){
        currentOpenedEl.find('div').last().find('img').addClass('hide').parent().html('<h4 id="timergas" class="timer">'+secondsUntilClose+'</h4>');
    }else{
        currentOpenedEl.find('div').last().rotate(180, false);
    }
}

function openElectricityElement(){
    console.log('open electricity element');
    currentOpenedEl.find('div').first().css('background',"url(assets/electricity/thunderstruck.png) no-repeat, url(assets/textures/electricity.jpg) repeat").css('background-position','50% 100%, 0px 0px');
    if(isPresentationModeOn){
        currentOpenedEl.find('div').last().find('img').addClass('hide').parent().html('<h4 id="timerelectricity" class="timer">'+secondsUntilClose+'</h4>');
    }else{
        currentOpenedEl.find('div').last().rotate(180, false);
    }
}

function updateCloseTimer(){
    secondsPassed++;
    $('.timer').html(secondsUntilClose-secondsPassed);
    if(secondsPassed == secondsUntilClose){
        closeDataEl();
    }
}

function closeDataEl(){
    currentOpenedEl.css('cursor', 'default');
    currentOpenedEl.unbind();
    console.log('closeDataEl');
    clearInterval(closeTimer);
    currentOpenedEl.find('div').last().unbind().prev().unbind();
    currentOpenedEl.find('div').last().rotate(0, false);
    currentOpenedEl.find('div').last().find('img').removeClass('hide').next().remove();
    //refill timer status bar
    currentOpenedEl.find('div').first().next().find('div').first().stop().animate({
           width: '100%',
           marginLeft: '0%'
    },500);

    //make element smaller
    currentOpenedEl.animate({
            height: '224'
    }, 500).find('div').first().animate({
            height: '143',
            'background-position-y': '100%'
    }, 500, function(e){
        //generate new data elements
        generateOrderList(true);

        //reset
        currentOpenedEl = '';
        isOpen = false;

        //show next
        newPosition = -(dataElDefaultHeight-$('header').height());
        $('#data_elements').first().animate({
            marginTop:newPosition
        }, 500, function(e){
            //$('gas').unbind().on('mouseenter',hoverOverGas).on('mouseleave', hoverOutGas).on('click', selectOpenGasElement);
            //$('electricity').unbind().on('mouseenter',hoverOverGas).on('mouseleave', hoverOutGas).on('click', selectOpenGasElement);

            $('#data_elements').css('margin-top', $('header').height()).find('section').first().remove();
            openNextEl();
        });
    });
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