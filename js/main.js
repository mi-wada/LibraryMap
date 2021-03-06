$(function () {
    $("#loading").hide();
    $('#search_books').click(function () {
        //ローディング画面ON
        $("#loading").show();
        //地図上の情報を空にする
        refreshMap();
        //要素を空にする
        $(".library-infos").empty();
        $("#book-infos").empty();
        //検索フォームから入力を取得
        var bookNames = $('#book_names').val().split(',');
        $('#book-infos').append(formatBookInfo(bookNamesToISBNs(bookNames)[0]));
        //ローディング画面ON
        $("#loading").show();
        $(".left-contents").addClass("d-lg-block");
        $(".middle-contents").addClass("d-lg-block");
        $(".right-contents").addClass("col-lg-8");
        setTimeout(function () {
            //近隣の図書館で，蔵書が有る図書館を取得
            var librarys = searchLibrarys(bookNames, getUserPosition());
            for (var isbn in librarys) {
                var libraryNamesSplitByComma = "";
                var querySplitByComma = "";
                for (var i in librarys[isbn]['librarys']) {
                    librarysArr.push(librarys[isbn]['librarys'][i]);
                    var libraryName = librarys[isbn]['librarys'][i]['libraryName'];
                    var libraryAddress = librarys[isbn]['librarys'][i]['address'].replace(/\s+/g, "");
                    libraryNames.push(libraryName);
                    libraryAddresses.push(libraryAddress);
                    libraryNamesSplitByComma += libraryName + ',';
                    querySplitByComma += libraryName + '+' + '外観' + ',';
                }
                var openingHoursArray = getOpeningHours(libraryNamesSplitByComma);
                var imageURLs = getImage(querySplitByComma);
                for (var i in librarys[isbn]['librarys']) {
                    librarys[isbn]['librarys'][i]['opening_hours'] = openingHoursArray[i];
                    librarys[isbn]['librarys'][i]['image_url'] = imageURLs[i];
                    $('.library-infos').append(formatLibraryInfo(librarys[isbn]['librarys'][i]));
                }
            }
            //ローディング画面OFF
            $("#loading").hide();
            //マップにピンを立てる
            pinMap();
        }, 100);
    });
    //ルート検索のボタンがクリックされた時
    $(document).on('click', '.root-btn', function () {
        var address = $(this).parents('.library-info').find('p').text();
        drawRoute(address);
    });
    $(document).on('click', '#list-btn', function () {
        $(".left-contents").removeClass("d-none");
        $(".middle-contents").removeClass("d-none");
    });
    //初期表示でマップに現在位置を表示
    window.onload = initMap();
});
