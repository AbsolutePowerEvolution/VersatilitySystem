var Sammy = require('sammy');
var client = require('../../lib/client');
require('sammy/lib/plugins/sammy.mustache.js');

Sammy('#main', function() {
  this.use('Mustache', 'ms');

  this.get('#/user/property', function(context) {
    console.log('property');
    context.partial('/templates/user/property.ms').then(function() {
      getPropertyList(1, 5, 1);
    });
  });
});

function getPropertyList(pageNum, pageLength, createPageSwit) {
  client({
    path: 'user/property/others',
    method: 'GET',
    params: {
      page: pageNum,
      length: pageLength
    }
  }).then(function(response) {
    console.log(response);
    buildPropertyCard(response.entity.data);
    var propertyTotalPage = response.entity.total;
    if(createPageSwit) {
      buildPage(propertyTotalPage);
    }
  }).catch((response) => console.log(response));
}

function postPropertyRepair(propertyId, type, remark) {
  client({
    path: 'user/repair/create',
    method: 'POST',
    params: {
      property_id: propertyId,
      type: type,
      remark: remark
    }
  }).then(function(response) {
    console.log(response);
    //location.reload();
  }).catch((response) => console.log(response));
}

function buildPage(propertyTotalPage) {
  console.log('propertyTotalPage:' + propertyTotalPage);
  var i;
  var page = '<li class="active waves-effect"><a data-pageNum="1">1</a></li>';
  for(i = 1; i < propertyTotalPage / 5 - 1; i++) {
    page += '<li class="waves-effect"><a data-pageNum="' + (i + 1) + '">' + (i + 1) + '</a></li>  ';
  }
  page += '<li class="waves-effect"><a data-pageNum="next"><i class="material-icons">chevron_right</i></a></li>';
  $('#property_container').find('.pagination').append(page);
  pageEvent(propertyTotalPage / 5 - 1);
}

function pageEvent(limit) {
  var nowPage = 1;
  $('#property_container').find('.pagination a').on('click', function(event) {
    var $ActiveTarget;
    if(nowPage == parseInt($(this).data('pagenum'))) {
      return;
    } else if($(this).data('pagenum') == 'prev') {
      if(nowPage <= 1) {
        return;
      }
      $ActiveTarget = $(this).parent().parent().find('.active').prev();
      nowPage -= 1;
    } else if($(this).data('pagenum') == 'next') {
      if(nowPage >= limit) {
        return;
      }
      $ActiveTarget = $(this).parent().parent().find('.active').next();
      nowPage += 1;
    } else {
      $ActiveTarget = $(this).parent();
      nowPage = $(this).data('pagenum');
    }
    $(this).parent().parent().find('.active').removeClass('active');
    $ActiveTarget.addClass('active');
    getPropertyList(nowPage, 5, 0);
  });
}

function buildPropertyCard(propertyData) {
  var i;
  $('#property_system_content').find('.propertyContent').remove();
  for(i = 0; i < propertyData.length; i++) {
    var status = propertyData[i].status.id;//3: normal, 4:maintenance
    var color = status == 3 ? 'teal' : (status == 4 ? 'red' : 'blue');
    var divCard = '<div class="card propertyContent">';
    var divCardContent = '<div class="row card-content" ' +
                          'data-name="' + propertyData[i].name + '"' +
                          'data-propertyid="' + propertyData[i].id + '"' +
                          'data-describe="' + propertyData[i].describe + '">';
    var spanName = '<span class="col s4 center-align">' + propertyData[i].name + '</span>';
    var spanStatus = '<span class="col s4 center-align" style="color:' + color + '">' +
                      propertyData[i].status.name + '</span>';
    var spanBtn = '<span class="col s4 center-align"><a class="waves-effect waves-light btn modal-trigger ' +
                  (status == 4 ? 'disabled' : '') +
                  '" data-modal_target="property_modal"><i class="material-icons left">build</i>報修/清理' +
                  '</a></span></div></div>';
    $('#property_system_content').append(divCard + divCardContent + spanName + spanStatus + spanBtn);
  }
  propertyBindEvent();
}

function propertyBindEvent() {
  var $propertyContainer = $('#property_container');
  $propertyContainer.find('#property_system').on('click', function(event) {
    $('#property_system').addClass('purple darken-4').css('color', 'white');
    $('#property_history').removeClass('purple darken-4').addClass('white').css('color', 'black');
    $('#property_system_content').css('display', 'block');
    $('#property_history_content').css('display', 'none');
  });

  $propertyContainer.find('#property_history').on('click', function(event) {
    $('#property_system').removeClass('purple darken-4').addClass('white').css('color', 'black');
    $('#property_history').addClass('purple darken-4').css('color', 'white');
    $('#property_system_content').css('display', 'none');
    $('#property_history_content').css('display', 'block');
  });

  var $modalTarget;
  $propertyContainer.find('.modal-trigger').on('click', function(event) {
    if($(this).hasClass('disabled')) { return; }

    $('#materialize-lean-overlay-30').css('display', 'block');
    $modalTarget = $('#' + $(this).data('modal_target'));
    $modalTarget.fadeIn();

    var ele = $(this).parent().parent();
    $modalTarget.find('.modal-content h4').html(ele.data('name'));
    $modalTarget.find('p').html(ele.data('describe'));
    $modalTarget.data('propertyid', ele.data('propertyid'));
  });

  $propertyContainer.find('.modal-close, #materialize-lean-overlay-30').on('click', function(event) {
    $('#materialize-lean-overlay-30').css('display', 'none');
    $modalTarget.fadeOut();
  });

  $propertyContainer.find('#property_repair_submit').on('click', function(event) {
    var type = $modalTarget.find('input[type="radio"]:checked').val();
    var propertyid = $modalTarget.data('propertyid');
    var remark = $modalTarget.find('#reason').val();
    postPropertyRepair(propertyid, type, remark);
  });
}
