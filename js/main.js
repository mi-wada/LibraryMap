$(function () {
    $('#search_books').click(function () {
        //検索フォームから入力を取得
        var bookNames = $('#book_names').val().split(',');
        //ユーザの位置情報を取得
        getLatLng();
        //近隣の図書館で，蔵書が有る図書館を取得
        var librarys = searchLibrarys(bookNames, userPosition);
        //マップにピンを表示
        libraryMap();
        for (var i in librarys) {
            //図書館の開館情報を取得
            librarys[i]['opening_hours'] = getOpeningHours(librarys[i]['libraryName']);
            //図書館の外観画像を取得
            librarys[i]['image_url'] = getImage(librarys[i]['libraryName'] + '+' + '外観');
        }
        console.log(librarys);
    });
});

//緯度軽度を返す関数
function getLatLng() {
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(successLatLng);
        } else {
        navigator.geolocation.getCurrentPosition(errorPosition);
    }
}

function successLatLng(position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    var userPosition = [lat, lng];
    return userPosition;
}

//現在位置表示
function initMap() {  
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(successPosition);
        } else {
        navigator.geolocation.getCurrentPosition(errorPosition);
    }
}

//現在位置を取得できる場合の関数
function successPosition(position) {
  var lat = position.coords.latitude;
  var lng = position.coords.longitude;
  var current = new navitime.geo.LatLng(lat, lng);
  map = new navitime.geo.Map('map', current, 15);
  pin = new navitime.geo.overlay.Pin({
  icon:'./images/pin.png',
  position:current,
  draggable:false,
  map:map,
  title:'現在位置'
  });
  infoWindow = new navitime.geo.overlay.InfoWindow({
    map:map,
    position:current,
    content:'現在位置'
  });
}

//現在位置を取得できない時の関数
function errorPosition() {
    alert("現在位置を取得できません。");
}

window.onload = initMap();

/**
 * 地図に検索対象の図書館のピンを立てる
 */
function libraryMap() {
    document.getElementById('map').innerHTML = '';
    navigator.geolocation.getCurrentPosition(displayPin);
  }
  
  /**
   * 現在位置と図書館のピンを表示する
   * @param {*} position 
   */
  function displayPin(position) {
    var current_lat = position.coords.latitude;
    var current_lng = position.coords.longitude;
    var current = new navitime.geo.LatLng(current_lat, current_lng);
    map = new navitime.geo.Map('map', current, 8);
    pin = new navitime.geo.overlay.Pin({
    icon:'./images/pin.png',
    position:current,
    draggable:false,
    map:map,
    title:'現在位置'
    });
    infoWindow = new navitime.geo.overlay.InfoWindow({
      map:map,
      position:current,
      content:'現在位置'
    });
    var baseUrl = 'https://api-service.instruction.cld.dev.navitime.co.jp/teamc/v1';
    libraries.forEach(library => {
        axios
            .get(baseUrl + `/spot?word=${library.libraryName}`)
            .then(connectSuccess)
            .catch(connectFailure);
    });
  }
  
  /**
   * 対象図書館のAPIにアクセスできた時に呼ぶ関数
   * @param {*} response 
   */
  function connectSuccess(response) {
    var spot = response.data.items[0];
    var spot_lat = spot.coord.lat;
    var spot_lng = spot.coord.lon;
    var spot_name = spot.name;
    mapLatLng = new navitime.geo.LatLng(spot_lat, spot_lng);
    //ピンを立てる
    pin = new navitime.geo.overlay.Pin({
        icon:'./images/pin.png',
        position:mapLatLng,
        draggable:false,
        map:map,
        title:spot_name,
    });
    //吹き出しを表示
    infoWindow = new navitime.geo.overlay.InfoWindow({
      map:map,
      position:mapLatLng,
      content:spot_name
    });
    //吹き出しの切り替えをあとで行う予定
    // infoWindow.setVisible(false);
}
  
/**
 * ピンの取得に失敗した時に呼ぶ関数
 * @param {*} error 
 */
function connectFailure(error) {
  alert("error", error);
}

