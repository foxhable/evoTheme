let notCompletedThemes = [];
let completedThemes = [];
let userGotData = false;

let createTheme = {
  themeCreating: '',
  notCompleted: function (theme) {
    this.themeCreating = theme;

    const itemDiv = this.itemDiv();

    $(this.chkBox()).prependTo(itemDiv);
    $(this.removeBtn()).appendTo(itemDiv);

    $(itemDiv).appendTo('.main__lists__not-completed .main__lists-item__body');
  },
  completed: function (theme) {
    this.themeCreating = theme;

    const itemDiv = this.itemDiv();

    $(this.chkBox()).prependTo(itemDiv).addClass('chkbox--active');
    $(this.removeBtn()).appendTo(itemDiv);

    $(itemDiv).appendTo('.main__lists__completed .main__lists-item__body');
  },

  itemDiv: function () {
    return $('<div />', {
      'class': 'main__lists-item__body-item',
      html: `
      <div class='main__lists-item__body-item__text'>${this.themeCreating}</div>
      `
    });
  },

  chkBox: function () {
    return $('<div />', {
      'class': 'main__lists-item__body-item__chkbox',
      title: 'Выполнено',
      on: { click: checkBoxHandler }
    })
  },

  removeBtn: function () {
    return $('<div />', {
      'class': 'main__lists-item__body-item__remove-btn',
      title: 'Удалить тему',
      on: { click: deleteThemeHandler }
    })
  },
}

function checkBoxHandler() {
  const themeItemDiv = $(this).parent();
  const themeTextDiv = $(this).parent().children().get(1);
  const themeText = $(themeTextDiv).text();
  const listsDiv = $(this).parents().get(2);

  if ($(listsDiv).hasClass('main__lists__not-completed')) {
    $(this).addClass('chkbox--active');

    const themeIndex = notCompletedThemes.indexOf(themeText);
    notCompletedThemes.splice(themeIndex, 1);
    completedThemes.push(themeText);

    $(themeItemDiv).appendTo('.main__lists__completed .main__lists-item__body');
  } else {
    $(this).removeClass('chkbox--active');

    const themeIndex = completedThemes.indexOf(themeText);
    completedThemes.splice(themeIndex, 1);
    notCompletedThemes.push(themeText);

    $(themeItemDiv).appendTo('.main__lists__not-completed .main__lists-item__body');
  }
};

function deleteThemeHandler() {
  const themeItemDiv = $(this).parent();
  const themeTextDiv = $(this).parent().children().get(1);
  const themeText = $(themeTextDiv).text();
  const listsDiv = $(this).parents().get(2);

  $(themeItemDiv).remove();

  if ($(listsDiv).hasClass('main__lists__not-completed')) {
    const themeIndex = notCompletedThemes.indexOf(themeText);

    notCompletedThemes.splice(themeIndex, 1);
  } else {
    const themeIndex = completedThemes.indexOf(themeText);

    completedThemes.splice(themeIndex, 1);
  }
}

function setDataInLists() {
  for (theme of notCompletedThemes) {
    createTheme.notCompleted(theme);
  };

  for (theme of completedThemes) {
    createTheme.completed(theme);
  };
}
$(function () {
  $('body').one('click', async function () {
    userGotData = true;

    const themesResponse = await fetch('/get-themes');
    const themesArr = await themesResponse.json();

    notCompletedThemes = Array.from(themesArr.nCompleted);
    completedThemes = Array.from(themesArr.completed);

    setDataInLists();
  });

  $('.main__add-btn').on('click', function () {
    const input = $('.main__body__func-add .main__body__func__input');
    const theme = String(input.val());

    if ( (theme === null) || (theme === undefined) || (theme === '') ) return;
    
    createTheme.notCompleted(theme);
    notCompletedThemes.push(theme);

    input.val('');
    $(input).trigger('focus');
  });

  $('.main__body__func-add .main__body__func__input').on('keypress', function (event) {
    if (event.key === 'Enter') {
      $('.main__add-btn').trigger('click')
    }
  });

  $('.main__list-btn, .close-lists-btn').on('click', function () {
    $('.main__body').toggleClass('main__body--lists-open');
    $('.main__lists').toggleClass('main__lists--open');
    $('.body__inner').toggleClass('hidden-before');
  });

  $('.main__lists__completed').on('click', function () {
    $(this).removeClass('lists-item--closed');
    $('.main__lists__not-completed').addClass('lists-item--closed');
  });

  $('.main__lists__not-completed').on('click', function () {
    $(this).removeClass('lists-item--closed');
    $('.main__lists__completed').addClass('lists-item--closed');
  });

  $('.main__get-btn').on('click', function () {
    const arrLength = notCompletedThemes.length;
    const randIndex = getRandomInt(arrLength)
    const theme = notCompletedThemes[randIndex];

    $('.main__body__func-get .main__body__func__input').val(theme);
  });

  $('.clear-all-list').on('click', function () {
    const listsDiv = $(this).parent().parent();
    const listsBodyDiv = $(listsDiv).children().get(1);

    if ($(listsDiv).hasClass('main__lists__not-completed')) {
      notCompletedThemes.length = '';
      $(listsBodyDiv).html('');
    } else {
      completedThemes.length = '';
      $(listsBodyDiv).html('');
    }

  });

  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
});

window.addEventListener("visibilitychange", function () {
  if (!userGotData) return;
  if (document.visibilityState === 'hidden') {
    let themes = {
      "nCompleted": notCompletedThemes,
      "completed": completedThemes
    };
    const blob = new Blob([JSON.stringify(themes)], { type: 'application/json; charset=UTF-8' });
    navigator.sendBeacon("/post-themes", blob);
  }
});
