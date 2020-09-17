/*
  本の名前の配列を受け取り，それに対応するISBNの配列を返す関数
  @param Array<string> bookNames 検索したい本の配列
  @return Array<string> ISBNs 引数に対するISBNの配列
*/
function bookNamesToISBNs(bookNames: Array<string>): Array<string> {
  const ISBNs: Array<string> = [];
  const googleBookAPI = "https://www.googleapis.com/books/v1/volumes?q={bookName}";
  for(let bookName of bookNames) {
    const requestURL: string = googleBookAPI.replace('{bookName}', bookName);
    const response = callAPI(requestURL);
    const ISBN = response.items[0].volumeInfo.industryIdentifiers[0].identifier;
    ISBNs.push(ISBN);
  }
  return ISBNs;
}
/*
  指定された地点付近の図書館のリストを返す関数
  @param Array<string> userPosition 緯度/経度
  @return dict libraryInfomations 近隣の図書館リストを返す
*/
function getSystemIDs(userPosition: Array<string>) {
  const carilURL: string = 'http://api.calil.jp/library?geocode={geocode}&limit=100&format=json&callback=';
  const requestURL: string = carilURL.replace('{geocode}', userPosition[1] + ',' + userPosition[0]);
  const response = callAPI(requestURL);
  const libraryInfomations = {};
  for(let library of response) {
    const libraryInfo = {
      [library.libkey]: {
        'libraryName': library.formal,
        'url': library.url_pc,
        'address': library.address,
        'tel': library.tel
      }
    };
    if(!libraryInfomations[library.systemid]) {
      libraryInfomations[library.systemid] = libraryInfo;
    } else {
      libraryInfomations[library.systemid] = Object.assign(libraryInfomations[library.systemid], libraryInfo);
    }
  }
  return libraryInfomations;
}
/*
  ISBNの配列を受け取り，その蔵書が有る図書館の情報を返す関数
  @param Array<string> ISBNs 検索したい本のISBNの配列
  @param Array<string> userPosition 緯度/経度
  @return dict librarys 蔵書のある図書館の情報の連想配列
*/
function searchLibrarysByISBNs(ISBNs: Array<string>, userPosition: Array<string>): Array<string> {
  const libraryInfomations = getSystemIDs(userPosition);
  const systemIDs = [];
  for (let systemid in libraryInfomations) {
    systemIDs.push(systemid);
  }
  const librarys: Array<string> = [];
  const carilURL: string = 'http://api.calil.jp/check?isbn={isbn}&systemid={systemIDs}&format=json&callback=no';
  for(let ISBN of ISBNs) {
    const requestURL: string = carilURL.replace('{isbn}', ISBN).replace('{systemIDs}', systemIDs.join());
    let response = callAPI(requestURL);
    for (let systemid in response.books[ISBN]) {
      for (let libkey in response.books[ISBN][systemid].libkey) {
        if(response.books[ISBN][systemid].libkey[libkey] === '貸出可' && libraryInfomations[systemid][libkey]) {
          librarys.push(libraryInfomations[systemid][libkey]);
        }
      }
    }
  }
  return librarys;
}
/*
  bookNamesに対し，蔵書のある図書館を返す関数
  @param Array<string> bookNames 図書名の配列
  @param Array<string> userPosition ユーザの現在位置(緯度/経度)
  @return dict librarys 蔵書の有る図書館の情報
*/
function searchLibrarys(bookNames: Array<string>, userPosition: Array<string>) {
  //入力された図書名をISBNに変換
  const ISBNs: Array<string> = bookNamesToISBNs(bookNames);
  const librarys = searchLibrarysByISBNs(ISBNs, userPosition);
  return librarys;
}
/*
  webAPIを叩く関数
  @param string url 叩きたいwebAPIのurl
  @return jsonオブジェクト
*/
function callAPI(url: string) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();
  if (xhr.status === 200) {
    return JSON.parse(xhr.responseText);
  } else {
    return [];
  }
}