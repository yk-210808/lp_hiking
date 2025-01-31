(function ($) {
  'use strict';

  // PC/SP判定
  // スクロールイベント
  // リサイズイベント
  // スムーズスクロール

  /* ここから */
  var break_point = 640; //ブレイクポイント
  var mql = window.matchMedia('screen and (max-width: ' + break_point + 'px)'); //、MediaQueryListの生成
  var deviceFlag = mql.matches ? 1 : 0; // 0 : PC ,  1 : SP

  // pagetop
  var timer = null;
  var $pageTop = $('#pagetop');
  $pageTop.hide();

  /**
   * scroll controll
   */
  var isScrollable = true;
  var winScroll;
  var getScrollPos = function () {
    if (!isScrollable) {
      return;
    }
    winScroll = window.scrollY || window.pageYOffset;
  }
  $(window).on('scroll', function () {
    getScrollPos();
  });
  getScrollPos();
  var scrollOff = function () {
    $('body').css({
        'cssText': 'position : fixed; top : ' + (-winScroll) + 'px !important; width: 100%;'
      })
      .addClass('fixed');
    isScrollable = false;
  };
  var scrollOn = function () {
    $('body').css({
        'position': '',
        'top': ''
      })
      .removeClass('fixed');
    window.scrollTo(0, winScroll);
    isScrollable = true;
  };

  // スクロールイベント
  $(window).on('scroll touchmove', function () {

    // スクロール中か判定
    if (timer !== false) {
      clearTimeout(timer);
    }

    // 200ms後にフェードイン
    timer = setTimeout(function () {
      if ($(this).scrollTop() > 100) {
        $('#pagetop').fadeIn('normal');
      } else {
        $pageTop.fadeOut();
      }
    }, 200);

    var scrollHeight = $(document).height();
    var scrollPosition = $(window).height() + $(window).scrollTop();
    var footHeight = parseInt($('#footer').innerHeight());


    if (deviceFlag == 0) { // → PC
      if (scrollHeight - scrollPosition <= footHeight) {
        // 現在の下から位置が、フッターの高さの位置にはいったら
        $pageTop.css({
          'position': 'absolute',
          'bottom': footHeight
        });
      }
    } else { // → SP
      $pageTop.css({
        'position': 'fixed',
        'bottom': '20px'
      });
    }

  });


  // リサイズイベント

  var checkBreakPoint = function (mql) {
    deviceFlag = mql.matches ? 1 : 0; // 0 : PC ,  1 : SP
    // → PC
    if (deviceFlag == 0) {
      scrollOn();
      $('.js--headerMenuBtn').removeClass('is_active');
      $('.js--headerMenu').removeClass('is_active');
    } else {
      // →SP
    }
    deviceFlag = mql.matches;
  }

  // ブレイクポイントの瞬間に発火
  mql.addListener(checkBreakPoint); //MediaQueryListのchangeイベントに登録

  // 初回チェック
  checkBreakPoint(mql);


  // スムーズスクロール
  // #で始まるアンカーをクリックした場合にスムーススクロール
  $('a[href^="#"]').on('click', function (e) {
    var speed = 500;
    // アンカーの値取得
    var href = $(this).attr('href');
    // 移動先を取得
    var target = $(href == '#' || href == '' ? 'html' : href);
    // 移動先を数値で取得
    var position = target.offset().top;

    const headerHeight = $('#header').outerHeight();

    // スムーススクロール lazyload対策で実際には２回スムーススクロール実行
    $.when(
      $("html, body").animate({
        scrollTop: position - headerHeight
      }, 400, "swing"),
      e.preventDefault(),
    ).done(function () {
      var diff = target.offset().top;
      if (diff === position) {} else {
        $("html, body").animate({
          scrollTop: diff
        }, 10, "swing");
      }
    });

    return false;
  });



  /**
   * Header
   */
  $(function () {
    if ($('#header')[0]) {
      const header = $('#header')
      let addBgFlg = false

      // bg
      $(window).on('scroll', function () {
        const changePosition = deviceFlag ? 75 : 200;

        if (!$('body').hasClass('fixed')) {
          if ($(this).scrollTop() > changePosition) {
            header.addClass('bg')
            addBgFlg = true
          } else {
            header.removeClass('bg')
            addBgFlg = false
          }
        }
      })

      // menu(sp)
      if ($('.js--headerMenuBtn')[0]) {
        const menuBtn = $('.js--headerMenuBtn')
        const menu = $('.js--headerMenu')

        menuBtn.on('click', function () {
          if ($(this).hasClass('is_active')) {
            $(this).removeClass('is_active')
            menu.removeClass('is_active')
            scrollOn()

            if (!addBgFlg) {
              header.removeClass('bg')
            }

          } else {
            $(this).addClass('is_active')
            menu.addClass('is_active')
            header.addClass('bg')
            scrollOff()
          }
        })
      }
    }
  })

  /**
   * Nav
   */
  $(function () {
    if ($('.js--nav')[0]) {
      const nav = $('.js--nav')
      const infoItems = $('.js--infoItems')
      const itemsParent = infoItems.parents('.info-block')

      const windowHeight = $(window).height()
      const parentTop = itemsParent.offset().top
      const parentExtra = deviceFlag ? 0 : 500


      let items = []

      for (const item of infoItems) {
        const newItem = {
          id: $(item).attr('id'),
          top: $(item).offset().top
        }
        items.push(newItem)
      }

      $(window).on('scroll', function () {
        const scroll = $(this).scrollTop()
        const scrollBottom = scroll + windowHeight
        const scrollCenter = scroll + windowHeight / 2
        const basePosition = deviceFlag ? scrollBottom : scrollCenter;

        if (basePosition < parentTop - parentExtra) { // Start
          const a = nav.find('a[data-block="0"]')
          nav.find('.current').removeClass('current')

          if (!a.hasClass('current')) {
            a.addClass('current')
          }

        } else { // 01, 02, 03
          const closestItem = infoItems.filter((item, index) => {
            return $(index).offset().top <= scrollBottom && $(index).offset().top > scroll
          })

          if (closestItem[0]) {
            const a = nav.find(`a[data-block="${$(closestItem[0]).attr('data-block')}"]`)
            nav.find('.current').removeClass('current')

            if (!a.hasClass('current')) {
              a.addClass('current')
            }
          }
        }
      })
    }
  })


})(jQuery);