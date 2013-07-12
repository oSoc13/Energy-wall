//TODO: absolute positioning timeline marker
//TODO: timeline marker arrows
//TODO: SAVE CANVAS IMAGE FOR REUSE (for graph)

$('document').ready(init);
//ELS = ELEMENTS

dataElDefaultHeight = 224;
dataElOpenHeight = 915;
dataTankUrl = 'http://localhost/osoc13/public/essent/';
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
secondsUntilClose = 6;
allowBindEvents = true;

//loading data elements
firstLoadEls = true;
numElementsToGenerate = 0;
lastElementAdded = '';
numGeneratedEls = 0;

gasHtml = '';
electricityHtml = '';

//stats vars
yearsToLoad = ['2008','2009','2010','2011','2012','2013'];
yearGasConsumptionData = [];
yearElectricityConsumptionData = [];
numYearDivisions = yearsToLoad.length;
yearTimer = 0;
yearSecondsPassed = 0;
currentIndex = 0;
currentYear = '2008';
additionalInfoPosVert = 'up';

//canvas graph stats
var canvasWidth = 0;
var canvasHeight = 0;
var circleBorderWidth = 11;
var dataCircleRadius = 11;
var specImageHeight = 27;

//rotation vars
timer = 0;
elToRotate = '';
step = 0;
total = 0;

//Init Setup
function init()
{
    console.log('Initialise');
    $(window).on('startCountDown', startCountdown);

    //load and structurize data
    loadYear(0);

    //header hover + click + first animation
    $('#presentation_mode').delay(1000).animate({
                marginLeft: 0
    }, 500, function(){
        $('#presentation_mode').delay(3000).animate({
                marginLeft: -295
        }, 500);
    });
    $('#presentation_mode_on').on('click', presModeOn);
    $('#presentation_mode_off').on('click', presModeOff);
    $('#presentation_mode').on('mouseenter', hoverOverPresentationMode).on('mouseleave', hoverOutPresentationMode);
    $('#header_content').on('click',goToSite).on('mouseenter',hoverOverHeader).on('mouseleave',hoverOutHeader);

    //generate order list
    getHtmlDataForPresentationItems();
    $(window).resize(function() {
        generateOrderList(0);
    });
}

function loadYear(yearindex){
    console.log('Loading data for '+yearsToLoad[yearindex]);
    //Calculate data per year (iterate function)

    //Loading circle
    $('.gas').first().find('.loading').fadeIn(900);
    $('.gas').first().find('.loading h5').text((yearindex+1)+'/'+yearsToLoad.length);
    pointTimer = '';
    if(yearindex == 0){
        numPoints = 1;
        pointTimer = setInterval(function(){
            console.log('setintervallllll');
            if(numPoints == 1){
                $('.gas').first().find('.loading p').text('Loading some awesome client data..');
                numPoints++;
            } else if(numPoints == 2){
                $('.gas').first().find('.loading p').text('Loading some awesome client data...');
                numPoints++;
            }else{
                $('.gas').first().find('.loading p').text('Loading some awesome client data.');
                numPoints = 1
            }
        }, 400);//Loading some awesome client data.
    }

    var url = dataTankUrl+yearsToLoad[yearindex]+'.json';
    $.ajax({
        dataType: "json",
        type:'GET',
        url:url,
        success: function(clientsdata){
            //parsedData = $.parseJSON(clientsdata);
            var yearEls = clientsdata[yearsToLoad[yearindex]];
            numTotalUsers = 0;

            arrGasConsumptionUsers = [];
            arrElectricityConsumptionUsers = [];
            numDOMUsers = 0;

            numGasContractUsers = 0;
            numGasSocialUsers = 0;
            numGasGroupUsers = 0;
            numElectricityContractUsers = 0;
            numElectricitySocialUsers = 0;
            numElectricityGroupUsers = 0;
            numElectricitySolarUsers = 0;
            $.each(yearEls, function(key){
                numTotalUsers++;
                if(yearEls[key]['gas_verbruik'] != 'null' && yearEls[key]['gas_verbruik'] != ''){
                    arrGasConsumptionUsers.push(yearEls[key]['gas_verbruik']);
                }
                if(yearEls[key]['elek_verbruik'] != 'null' && yearEls[key]['elek_verbruik'] != ''){
                    arrElectricityConsumptionUsers.push(yearEls[key]['elek_verbruik']);
                }
                if(yearEls[key]['betalingswijze'] == 'DOM'){
                    numDOMUsers++;
                }

                if(yearEls[key]['gas_contract'] == 'TRUE'){
                    numGasContractUsers++;
                }
                if(yearEls[key]['gas_sociaaltarief'] == 'TRUE'){
                    numGasSocialUsers++;
                }
                if(yearEls[key]['gas_groepstarief'] == 'TRUE'){
                    numGasGroupUsers++;
                }

                if(yearEls[key]['elek_contract'] == 'TRUE'){
                    numElectricityContractUsers++;
                }
                if(yearEls[key]['elek_sociaaltarief'] == 'TRUE'){
                    numElectricitySocialUsers++;
                }
                if(yearEls[key]['elek_groepstarief'] == 'TRUE'){
                    numElectricityGroupUsers++;
                }
                if(yearEls[key]['elek_zonnepanelen'] == 'TRUE'){
                    numElectricitySolarUsers++;
                }
            });
            numDOMUsers = Math.round(numDOMUsers/(numTotalUsers/100));
            percentOV = 100 - numDOMUsers;

            //Gas calculations
            percentGasContract = Math.round(numGasContractUsers/(numTotalUsers/100));
            percentGasSocial = Math.round(numGasSocialUsers/(numTotalUsers/100));
            percentGasGroup = Math.round(numGasGroupUsers/(numTotalUsers/100));

            sumGasConsumption = 0;
            numGasUsers = arrGasConsumptionUsers.length;
            $.each(arrGasConsumptionUsers, function(k){
                sumGasConsumption += parseFloat(arrGasConsumptionUsers[k]/*.replace('"', '')*/);
            });
            averageGasConsumption = Math.round(sumGasConsumption/numGasUsers);
            minimumGasConsumption = Math.min.apply(Math,arrGasConsumptionUsers);
            maximumGasConsumption = Math.max.apply(Math,arrGasConsumptionUsers);
            generalYearGasData = [averageGasConsumption, minimumGasConsumption, maximumGasConsumption, numDOMUsers, percentOV, percentGasContract, percentGasSocial, percentGasGroup];
            console.log(generalYearGasData);
            yearGasConsumptionData.push(generalYearGasData);

            //Electricity calculations
            percentElectricityContract = Math.round(numElectricityContractUsers/(numTotalUsers/100));
            percentElectricitySocial = Math.round(numElectricitySocialUsers/(numTotalUsers/100));
            percentElectricityGroup = Math.round(numElectricityGroupUsers/(numTotalUsers/100));
            percentElectricitySolar = Math.round(numElectricitySolarUsers/(numTotalUsers/100));

            sumElectricityConsumption = 0;
            numElectricityUsers = arrElectricityConsumptionUsers.length;
            $.each(arrElectricityConsumptionUsers, function(k){
                sumElectricityConsumption += parseFloat(arrElectricityConsumptionUsers[k]/*.replace('"', '')*/);
            });
            averageElectricityConsumption = Math.round(sumElectricityConsumption/numElectricityUsers);
            minimumElectricityConsumption = Math.min.apply(Math,arrElectricityConsumptionUsers);
            maximumElectricityConsumption = Math.max.apply(Math,arrElectricityConsumptionUsers);
            generalYearElectricityData = [averageElectricityConsumption, minimumElectricityConsumption, maximumElectricityConsumption, percentOV, percentGasContract, percentElectricityContract, percentElectricitySocial, percentElectricityGroup, percentElectricitySolar];
            yearElectricityConsumptionData.push(generalYearElectricityData);

            if(yearindex < yearsToLoad.length-1){
                loadYear(yearindex+1);
            }else{
                clearInterval(pointTimer);
                $('.gas').first().find('.loading').fadeOut(300, function(e){
                    $(this).remove();
                    currentOpenedEl.find('.stats').removeClass('hide').fadeIn(600, function(e){
                        loadCanvas();
                    });
                });
            }
        }
    });
}

//Hover + click states HEADER: presentation mode
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
        loadCanvas();
        secondsPassed = 0;
        closeTimer = setInterval(updateCloseTimer, 1000);
        //reset year
        yearTimer = setInterval(updateYearTimer, Math.round(secondsUntilClose/numYearDivisions)*1000);
        delayTimer = setInterval(function(){
            clearInterval(delayTimer);
            $('.stats .current').removeClass('current');
            $('.stats ul').find('li').first().addClass('current');
        }, 250);
        $('.selector').animate({
            left: $('.stats ul').find('li').first().position().left + $('.stats .current').first().width()*1.54
        }, 500);

        currentOpenedEl.find('div').first().next().find('div').first().animate({
           width: '2%',
           marginLeft: '49%'
        },secondsUntilClose*1000,'linear');
        currentOpenedEl.find('div').last().rotate(0, false);
        if(currentSelected == 'gas'){
            currentOpenedEl.find('div').last().html('<h4 id="timergas" class="timer">'+(secondsUntilClose-secondsPassed)+'</h4>');
        }else{
            currentOpenedEl.find('div').last().html('<h4 id="timerelectricity" class="timer">'+(secondsUntilClose-secondsPassed)+'</h4>');
        }
    }
}

function presModeOff(e){
    e.preventDefault();
    $(this).addClass('selected');
    $(this).prev().removeClass('selected');
    isPresentationModeOn = false;
    if(isOpen){
        reset();
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

//Hover + click states HEADER: site
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

//load html-data (data elements gas & electricity) from server
function getHtmlDataForPresentationItems(){
    if(gasHtml != '' && electricityHtml != ''){
        generateOrderList(0);
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
                        generateOrderList(0);
                    }
                });
            }
        });
    }
}

//dynamic data element generation method
function generateOrderList(numElsToMake){
    //calculate number of elements to generate from window height
    numElementsToGenerate = Math.ceil(($(window).height() - $('header').height())/dataElDefaultHeight)-numGeneratedEls;
    if(numElementsToGenerate == 1 && firstLoadEls){
        numElementsToGenerate++;
    }
    if(numElsToMake != 0){
        numElementsToGenerate = numElsToMake;
    }
    //generating the elements
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
    //reposition open buttons
    $('.status_el').css('margin-left', $(window).width()/2-$('.status_el').width()/2);

    //binding the hover + click events after a certain action
    if(allowBindEvents){
        //hover + click progress
        $('.gas').unbind().on('mouseenter',hoverOverGas).on('mouseleave', hoverOutGas).on('click', selectOpenGasElement);
        $('.electricity').unbind().on('mouseenter',hoverOverElectricity).on('mouseleave', hoverOutElectricity).on('click', selectOpenElectricityElement);
    }else{
        allowBindEvents = true;
    }
    if(isOpen){
        currentOpenedEl.unbind();
    }

    //prepare the opening of the first element
    if(firstLoadEls){
        currentOpenedEl = $('.gas').first();
        isOpen = true;
        openElement();
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
    selectOpenElement();
}

function selectOpenElectricityElement(e){
    currentSelected = 'electricity';
    currentOpenedEl = $(this);
    selectOpenElement();
}

function selectOpenElement(){
    //reset year timeline
    $('.dataEl').unbind();
    $('#data_elements').find('section').first().find('div').first().next().find('div').first().stop().animate({
           width: '100%',
           marginLeft: '0%'
    },500);

    //remove elements above clicked element
    elementsToRemove = 0;
    $('.dataEl').each(function(e){
       if($(this).index() == currentOpenedEl.index()){
           elementsToRemove = $(this).index();
       }
    });
    console.log('elements to remove '+elementsToRemove);

    //animate info to top
    //console.log('graph add info: '+currentOpenedEl.find('.graph_add_info'));
    $('.graph_add_info').animate({
        top: '0px'
    }, 200);

    //reset events and related vars
    reset();

    newMarginTop = 0;
    if(isOpen){
        newMarginTop = (-((elementsToRemove-1)*dataElDefaultHeight + dataElOpenHeight)) + $('header').height();
    }else{
        newMarginTop = (-(elementsToRemove*dataElDefaultHeight)) + $('header').height();
    }

    //generate new data elements
    allowBindEvents = false;
    generateOrderList(elementsToRemove+2);

    $('#data_elements').animate({
       marginTop: newMarginTop
    }, 1000, function(){
        $('.dataEl:lt('+ elementsToRemove +')').remove();
        $('.dataEl:gt('+ ($('.dataEl').length-3) +')').remove();
        $('#data_elements').css('margin-top',$('header').height());

        isOpen = true;
        openElement();
    });
}

function openElement(){
    secondsPassed = 0;

    //set year marker
    $('.selector').css('left',$('.stats .yearnav').find('li').first().position().left + $('.stats .current').first().width()*1.54);

    newHeight = 834 + 30;
    currentOpenedEl.find('.gas_content').animate({
        paddingTop: '40px'
    }, { duration: 500, queue: false });
    currentOpenedEl.unbind().animate({
        height: dataElOpenHeight
    }, { duration: 500, queue: false }).find('div').first().animate({
        height: newHeight,
        'background-position-y': '100%',
        'background-position-x': '50%'
    }, 500, function(e){
            if(currentSelected == 'gas'){
                currentOpenedEl.find('div').last().on('mouseenter', hoverOverGasWhileOpen).on('mouseleave', hoverOutGasWhileOpen).on('click',closeDataEl).prev().on('mouseenter', hoverOverGasWhileOpen).on('mouseleave', hoverOutGasWhileOpen).on('click',closeDataEl);
            }else{
                currentOpenedEl.find('div').last().on('mouseenter', hoverOverElectricityWhileOpen).on('mouseleave', hoverOutElectricityWhileOpen).on('click',closeDataEl).prev().on('mouseenter', hoverOverElectricityWhileOpen).on('mouseleave', hoverOutElectricityWhileOpen).on('click',closeDataEl);
            }
            $('.gas').unbind().on('mouseenter',hoverOverGas).on('mouseleave', hoverOutGas).on('click', selectOpenGasElement);
            $('.electricity').unbind().on('mouseenter',hoverOverElectricity).on('mouseleave', hoverOutElectricity).on('click', selectOpenElectricityElement);
            currentOpenedEl.unbind();

            $('.selector').find('a').first().hide();

            //show data visualisation
            if(!firstLoadEls){
                currentOpenedEl.find('.stats').removeClass('hide').fadeIn(200, function(e){
                    loadCanvas();
                });
            }else{
                firstLoadEls = false;
            }
    }).css('cursor', 'default');

    if(currentSelected == 'gas'){
        openGasElement();
    }else{
        openElectricityElement();
    }
}

function startCountdown(){
    console.log('startCountdown');

    //load data - setup timer divisions years
    currentIndex = 0;
    currentYear = '2008';
    $('.stats .current').removeClass('current');
    $('.stats .yearnav').find('li').first().addClass('current');
    clearInterval(yearTimer);
    yearTimer = setInterval(updateYearTimer, Math.round(secondsUntilClose/numYearDivisions)*1000);

    //Presentation mode autoplay
    clearInterval(closeTimer);
    closeTimer = setInterval(updateCloseTimer, 1000);
    currentOpenedEl.find('div').first().next().find('div').first().animate({
       width: '2%',
       marginLeft: '49%'
    },secondsUntilClose*1000,'linear');
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

//year ticker method
function updateYearTimer(){
    console.log('change year');
    yearSecondsPassed++;
    console.log('yeardivisions: '+numYearDivisions);
    if(yearSecondsPassed < numYearDivisions){
        //Update year selector (nav) + general data vars (currentindex,...)
        if(currentIndex < yearsToLoad.length-1){
            currentIndex++;
            delayTimer = setInterval(function(){
                clearInterval(delayTimer);
                $('.stats .current').removeClass('current').next().addClass('current');
            }, 250);
            $('.selector').animate({
                left: $('.stats .current').next().position().left + $('.stats .current').first().width()*1.54
            }, 500);
        }else{
            currentIndex = 0;
            delayTimer = setInterval(function(){
                clearInterval(delayTimer);
                $('.stats .current').removeClass('current');
                $('.stats ul').find('li').first().addClass('current');
            }, 250);
            $('.selector').animate({
                left: $('.stats ul').find('li').first().position().left + $('.stats .current').first().width()*1.54
            }, 500);
        }
        currentYear = yearsToLoad[currentIndex];
        if(currentIndex == 0){
            $('.selector').find('a').first().fadeOut();
            $('.selector').find('a').last().fadeIn();
        }else if(currentIndex == yearsToLoad.length-1){
            $('.selector').find('a').first().fadeIn();
            $('.selector').find('a').last().fadeOut();
        }else{
            $('.selector').find('a').first().fadeIn();
            $('.selector').find('a').last().fadeIn();
        }

        //UPDATE GRAPH DATA
        //animate point
        $("#graph_canvas").animateLayer('datapointselected', {
            opacity:0
        }, 100, function(){
            $("#graph_canvas").removeLayer('datapointselected');
            $('#graph_canvas').drawImage({
              layer:true,
              name: 'datapointselected',
              source: 'assets/canvas/datapointselected.png',
              fromCenter: false,
              opacity: 0,
              x: $("#graph_canvas").getLayer('datapoint'+currentIndex).x, y:$("#graph_canvas").getLayer('datapoint'+currentIndex).y
            }).animateLayer('datapointselected', {
              opacity:1
            }, 100, 'linear');
        });
        //animate additional info signs
        $("#graph_canvas").animateLayer('dataspec0', {
            opacity:0
        }, 100).animateLayer('dataspec1', {
            opacity:0
        }, 100).animateLayer('dataspec2', {
            opacity:0
        }, 100, function(){
            $("#graph_canvas").removeLayer('dataspec0');
            $("#graph_canvas").removeLayer('dataspec1');
            $("#graph_canvas").removeLayer('dataspec2');
            drawGraphAdditionalInfo();
        });

        //change circle data
        drawCircleData();
    }
}

//close ticker method
function updateCloseTimer(){
    secondsPassed++;
    $('.timer').html(secondsUntilClose-secondsPassed);
    if(secondsPassed == secondsUntilClose){
        closeDataEl();
    }
}

function closeDataEl(){
    console.log('close data');
    //fadeout stats
    currentOpenedEl.find('div').first().find('div').first().fadeOut(200);

    //reset events and related vars
    reset();

    //animate title to original position
    currentOpenedEl.find('.gas_content').animate({
        paddingTop: '70px'
    }, { duration: 500, queue: false });

    //fade data out + additional info animate to top
    currentOpenedEl.find('.stats').fadeOut();
    currentOpenedEl.find('.graph_add_info').animate({
        top: '80px'
    }, 200);

    currentOpenedEl.find('div').last().unbind().prev().unbind();
    currentOpenedEl.find('div').last().rotate(0, false);
    currentOpenedEl.find('div').last().find('img').removeClass('hide').next().remove();
    //refill timer status bar
    currentOpenedEl.find('div').first().next().find('div').first().stop().animate({
           width: '100%',
           marginLeft: '0%'
    },{ duration: 500, queue: false });

    //make element smaller
    currentOpenedEl.animate({
            height: '224'
    }, { duration: 500, queue: false }).find('div').first().animate({
            height: '143',
            'background-position-y': '100%'
    }, 500, function(e){
        //generate new data elements
        generateOrderList(1);

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
            $('.selector').find('a').last().fadeIn();
        });
    });
}

function reset(){
    $('.dataEl').css('cursor', 'default');
    $('.dataEl').unbind();
    //reset year timeline
    currentIndex = 0;
    currentYear = '2008';
    yearSecondsPassed = 0;
    clearInterval(yearTimer);
    clearInterval(closeTimer);
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

//All canvas shizzle
function loadCanvas(){
    canvasWidth = $('#graph_canvas').get(0).width;
    canvasHeight = $('#graph_canvas').get(0).height;

    //draw circle data
    drawCircleData();

    //get averages from precalculated array
    arrAverages = [];
    minimumAverage = arrConsumptionData[0][0];
    for(var i = 0; i<arrConsumptionData.length; i++){
        arrAverages.push(arrConsumptionData[i][0]);
        if(arrConsumptionData[i][0] < minimumAverage){
            minimumAverage = arrConsumptionData[i][0];
        }
    }

    //draw averages graph
    highestAverage = Math.max.apply(Math, arrAverages);
    scaleFactor = (canvasHeight-(dataCircleRadius*2))/(highestAverage-minimumAverage);
    for(var j = 0; j<arrAverages.length; j++){
        $('#graph_canvas').drawImage({
          layer:true,
          name: 'datapoint'+j,
          source: dataPointUrl,
          fromCenter: false,
          opacity: 0,
          x: j*192, y:canvasHeight - (arrAverages[j] - minimumAverage)*scaleFactor-(dataCircleRadius*2)
        }).delayLayer('datapoint'+j, (j*100)-100).animateLayer('datapoint'+j, {
          opacity:1
        }, 400, 'linear');

        if(j == 0){
            //Show white point
            $('#graph_canvas').drawImage({
              layer:true,
              name: 'datapointselected',
              source: 'assets/canvas/datapointselected.png',
              fromCenter: false,
              opacity: 0,
              x: j*192, y:canvasHeight - (arrAverages[j] - minimumAverage)*scaleFactor-(dataCircleRadius*2)
            }).delayLayer('datapointselected', (j*100)-100).animateLayer('datapointselected', {
              opacity:1
            }, 400, 'linear');
        } else if(j == 1){
            //draw line between points
            $("#graph_canvas").drawLine({
              layer:true,
              name: 'line'+(j-1),
              strokeStyle: color,
              strokeWidth: 4,
              x1: $("#graph_canvas").getLayer('datapointselected').x + dataCircleRadius, y1: $("#graph_canvas").getLayer('datapointselected').y + dataCircleRadius,
              x2: $("#graph_canvas").getLayer('datapoint'+j).x + dataCircleRadius, y2: $("#graph_canvas").getLayer('datapoint'+j).y + dataCircleRadius,
              opacity: 0
            }).delayLayer('line'+(j-1), (j*100)-100).animateLayer('line'+(j-1), {
              opacity:1
            }, 400, 'linear');
        } else {
            $("#graph_canvas").drawLine({
              layer:true,
              name: 'line'+(j-1),
              strokeStyle: color,
              strokeWidth: 4,
              x1: $("#graph_canvas").getLayer('datapoint'+(j-1)).x + dataCircleRadius, y1: $("#graph_canvas").getLayer('datapoint'+(j-1)).y + dataCircleRadius,
              x2: $("#graph_canvas").getLayer('datapoint'+j).x + dataCircleRadius, y2: $("#graph_canvas").getLayer('datapoint'+j).y + dataCircleRadius,
              opacity: 0
            }).delayLayer('line'+(j-1), (j*100)-100).animateLayer('line'+(j-1), {
              opacity:1
            }, 400, 'linear');
        }
    }

    //draw additional info
    drawGraphAdditionalInfo();

    //position points above lines (z-index)
    for(var o = 0; o<arrAverages.length; o++){
        $('#graph_canvas').moveLayer('datapoint'+o, 100+o);
    }
    $('#graph_canvas').moveLayer('datapointselected', 120);

    if(isPresentationModeOn){
        $(window).trigger('startCountDown');
    }
}

function drawCircleData(){
    //detect energy kind
    color = '';
    dataPointUrl = '';
    arrConsumptionData = '';
    if(currentSelected == 'gas'){
        color = '#851e03';
        dataPointUrl = 'assets/canvas/datapointgas.png';
        arrConsumptionData = yearGasConsumptionData;
        currentOpenedEl.find('.solar').remove();
    }else{
        color = '#002e36';
        dataPointUrl = 'assets/canvas/datapointelectricity.png';
        arrConsumptionData = yearElectricityConsumptionData;
        currentOpenedEl.find('.solar').removeClass('hide');
    }

    arrCanvases = currentOpenedEl.find('.circle_param canvas');
    arrContexts = [];
    for(var u = 0; u<arrCanvases.length; u++){
        context = arrCanvases[u].getContext("2d");
        arrContexts.push(context);
    }

    for(var p = 3; p<arrConsumptionData[currentIndex].length; p++){
        canvas = arrCanvases[p-3];
        context = arrContexts[p-3];

        //clear canvas + (re)start drawing
        context.clearRect(0, 0, canvas.width,  canvas.height);
        context.beginPath();
        context.lineWidth = circleBorderWidth;
        if(p-3 == 0 || p-3 == 1){
            context.strokeStyle = '#fff';
        }else{
            context.strokeStyle = color;
        }
        context.arc(canvas.width/2, canvas.height/2, canvas.width/2-circleBorderWidth/2, -Math.PI/2, -Math.PI/2+(((2*Math.PI/100)*arrConsumptionData[currentIndex][p])));
        context.stroke();
        context.closePath();

        $(canvas).prev().text(arrConsumptionData[currentIndex][p]);
    }

    //center circle params
    $('.percentages').css('width',(currentOpenedEl.find('.percentages div').length*180)-50);
}

function drawGraphAdditionalInfo(){
    additionalInfoPosVert = 'up';
    if($("#graph_canvas").getLayer('datapointselected').y > canvasHeight/2){
        additionalInfoPosVert = 'up';
    } else {
        additionalInfoPosVert = 'down';
    }

    if(additionalInfoPosVert == 'up'){
        for(var l = 0; l<3; l++){
            $('#graph_canvas').drawImage({
              layer:true,
              name: 'dataspec'+l,
              source: 'assets/canvas/dataspecup.png',
              fromCenter: true,
              opacity: 0,
              x: $("#graph_canvas").getLayer('datapointselected').x + dataCircleRadius, y:$("#graph_canvas").getLayer('datapointselected').y -12 - specImageHeight*l
            }).delayLayer('dataspec'+l, (l*100)-100).animateLayer('dataspec'+l, {
              opacity:1
            }, 200, 'linear');
        }
        currentOpenedEl.find('.graph_add_info').css('left', $("#graph_canvas").position().left + $("#graph_canvas").getLayer('dataspec1').x + 18)
        .css('top', $("#graph_canvas").position().top + $("#graph_canvas").getLayer('dataspec0').y - 27).fadeIn(700);
    }else{
        iterationsComplete = 0;
        for(var m = 0; m<3; m++){
            iterationsComplete++;
            $('#graph_canvas').drawImage({
              layer:true,
              name: 'dataspec'+m,
              source: 'assets/canvas/dataspecdown.png',
              fromCenter: true,
              opacity: 0,
              x: $("#graph_canvas").getLayer('datapointselected').x + dataCircleRadius, y:$("#graph_canvas").getLayer('datapointselected').y + specImageHeight*m + 35
            }).delayLayer('dataspec'+m, (m*100)-100).animateLayer('dataspec'+m, {
              opacity:1
            }, 400);
        }
        currentOpenedEl.find('.graph_add_info').css('left', $("#graph_canvas").position().left + $("#graph_canvas").getLayer('dataspec1').x + 18)
                .css('top', $("#graph_canvas").position().top + $("#graph_canvas").getLayer('dataspec2').y - 13).fadeIn(700);
    }
    averageCurrentYear = yearGasConsumptionData[currentIndex][0];
    minimumCurrentYear = yearGasConsumptionData[currentIndex][1];
    maximumCurrentYear = yearGasConsumptionData[currentIndex][2];
    currentOpenedEl.find('.value_average').text('Avg: '+averageCurrentYear).next().text('Min: '+minimumCurrentYear).next().text('Max: '+maximumCurrentYear);
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