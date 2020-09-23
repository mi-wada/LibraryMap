var pin = [];
var infoWindow = [];
var pinData = [];//[{name: "ナビタイム ", lat: 35.689614, lng: 139.691634}]
var libraryNames = [];

/**
 * 地図に検索対象の図書館のピンを立てる
 */
function pinMap() {
  getLibraryInfo();
  displayPin();
}

/**
 * 現在位置と図書館のピンを表示する
 */
function getLibraryInfo() {
  var baseUrl = 'https://api-service.instruction.cld.dev.navitime.co.jp/teamc/v1';
  libraryNames.forEach(libraryName => {
      axios
          .get(baseUrl + `/spot?word=${libraryName}`)
          .then(connectPinSuccess)
          .catch(connectPinFailure);
  });
}

/**
 * 対象図書館のAPIにアクセスできた時に呼ぶ関数
 */
function connectPinSuccess(response) {
  var spot = response.data.items[0];
  var spot_lat = spot.coord.lat;
  var spot_lng = spot.coord.lon;
  var spot_name = spot.name;
  pinData.push({name: spot_name, lat: spot_lat, lng: spot_lng});
}

/**
 * ピンの取得に失敗した時に呼ぶ関数
 */
function connectPinFailure(error) {
  alert("お探しの本がある図書館を取得できません。");
}

/**
 * ピンを立てる関数
 */
function displayPin() {
  for(var i = 0; i < pinData.length; i++) {
    pinLatLng = new navitime.geo.LatLng(pinData[i].lat, pinData[i].lng);
    pin[i] = new navitime.geo.overlay.Pin({
      icon:'./images/pin.png',
      position:pinLatLng,
      map:map,
      title:pinData[i].name,
    });
    infoWindow[i] = new navitime.geo.overlay.InfoWindow({
      map:map,
      position:pinLatLng,
      content:pinData[i].name
    });
    infoWindow[i].setVisible(false);
    pinEvent(i);
  }
}

/**
 * ピンに対するクリックイベントを追加
 */
function pinEvent(i) {
  new navitime.geo.util.addListener(pin[i] , "click" , function(){
    infoWindow[i].setVisible(true);
  });
}
