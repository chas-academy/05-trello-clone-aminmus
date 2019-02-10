import $ from 'jquery';

require('webpack-jquery-ui');
import '../css/styles.css';

/**
 * jtrello
 * @return {Object} [Publikt tillgänliga metoder som vi exponerar]
 */

// Här tillämpar vi mönstret reavealing module pattern:
// Mer information om det mönstret här: https://bit.ly/1nt5vXP
const jtrello = (function () {
  "use strict"; // https://lucybain.com/blog/2014/js-use-strict/

  // Referens internt i modulen för DOM element
  let DOM = {};

  /* =================== Privata metoder nedan ================= */
  function captureDOMEls() {
    DOM.$board = $('.board');
    DOM.$listDialog = $('#list-creation-dialog');
    DOM.$columns = $('.column');
    DOM.$lists = $('.list');
    DOM.$cards = $('.card');

    DOM.$newListButton = $('button#new-list');
    DOM.$deleteListButton = $('.list-header > button.delete');

    DOM.$newCardForm = $('form.new-card');
    DOM.$deleteCardButton = $('.card > button.delete');
  }

  function createTabs() { }
  function createDialogs() { }

  /*
  *  Denna metod kommer nyttja variabeln DOM för att binda eventlyssnare till
  *  createList, deleteList, createCard och deleteCard etc.
  */
  function bindEvents() {
    DOM.$newListButton.on('click', createList);
    DOM.$deleteListButton.on('click', deleteList);

    DOM.$newCardForm.on('submit', createCard);
    DOM.$deleteCardButton.on('click', deleteCard);
  }

  /* ============== Metoder för att hantera listor nedan ============== */
  function createList() {
    event.preventDefault();
    console.log("This should create a new list");
  }

  function deleteList() {
    console.log("This should delete the list you clicked on");
  }

  /* =========== Metoder för att hantera kort i listor nedan =========== */
  function createCard(event) {
    event.preventDefault();
    console.log("This should create a new card");

    // Gets user input for new card
    let input = $(this).find('input').val();

    // The <li> for the "Add New Card" form, acts as the bottom of our list
    let bottomOfList = $(this).parents(".list-cards").find(".add-new");

    // Adds new card at the bottom of the list
    $(bottomOfList).before("<li class='card ui-sortable-handle'>" + input + '<button class="button delete">X</button>' + '</li>');

    let newCard = bottomOfList.prev(".card");

    // Add event listeners to newly created card
    newCard.children('.card > button.delete').on('click', deleteCard);  // Delete

    newCard.data("name", input);

    // Dialog (for cards)
    $(".dialog").dialog({
      buttons: [
        {
          text: "X",
          click: function () {
            $(this).dialog("close");
          }
        }
      ]
    });


    // Dialog event handler
    $(".card").on('click', function () {
      let clickedCard = this;

      // Set dialog title
      $(".dialog").find("#description-tab > h3").text($(clickedCard).data('name'));

      // Check if deadline is set and updates dialog date accordingly
      if ($(clickedCard).data("deadline")) {
        $(".dialog").find("#description-tab  #datepicker").datepicker("setDate", $(clickedCard).data("deadline"));
      } else {
        $(".dialog").find("#description-tab  #datepicker").datepicker("setDate", "");
        console.log("no date");
      }

      // Check if description is set and updates dialog date accordingly
      if ($(clickedCard).data("description")) {
        $(".dialog").find("#description-tab   #card-description").val($(clickedCard).data("description"));
      } else {
        $(".dialog").find("#description-tab   #card-description").val("");
        console.log("no description");
      }

      // Add reference to the specific card clicked on, to be able to use with colorpicker widget
      $(".dialog").off().on("dialogopen", function (event, ui) {
        $(".dialog").data({ " cardReference": clickedCard });
        console.log("This is the card reference: ", $(".dialog").data(" cardReference"));
      });

      $(".dialog").dialog("open");


      // On dialog close
      $(".dialog").off().on("dialogclose", function (event, ui) {
        // Get data from dialog
        let cardDeadline = $(".dialog").find("#description-tab  #datepicker").val();
        let cardDescription = $(".dialog").find("#description-tab  #card-description").val();
        // Set data from dialog
        $(clickedCard).data({ "deadline": cardDeadline, "description": cardDescription })
        console.log("This is the data", $(clickedCard).data());
      });
    });

    // Tabs
    $("#tabs").tabs();

    // Datepicker
    $("#datepicker").datepicker('option', 'dateFormat', 'yy-mm-dd');

    // color picker
    $.widget('custom.colorpick', {
      _create() {
        $("#color-list").hide();

        $("#colorpicker").off().on("click", function () {
          $("#color-list").toggle('slow');
        });
        $("#color-list li").on("click", function () {
          let pickedColor = $(this).find("button").css("background-color");
          let cardRef = $(".dialog").data(" cardReference");
          $(cardRef).css("background-color", pickedColor);
        })
      }
    });

    $("#color-list").colorpick();

  }


  function deleteCard() {
    console.log("This should delete the card you clicked on");
    $(event.target).parent().remove();
  }

  // Metod för att rita ut element i DOM:en
  function render() { }

  // Metod för jQuery UI widgets
  function widgets() {

    // Sortable (for card lists)

    $(".list-cards").sortable({ connectWith: ".list-cards" });


    // Dialog (for cards)
    $(".dialog").dialog({
      modal: true,
      autoOpen: false,
      buttons: [
        {
          text: "X",
          click: function () {
            $(this).dialog("close");
          }
        }
      ]
    });

    $(".card").on('click', function () {
      $(".dialog").find("#description-tab > h3").text(this.childNodes[0].nodeValue);    // Gets the card text/content and puts it in dialog
      $(".dialog").dialog("open");
    })

    // Tabs
    $("#tabs").tabs();

    // Datepicker
    $("#datepicker").datepicker()
  }


  /* =================== Publika metoder nedan ================== */

  // Init metod som körs först
  function init() {
    console.log(':::: Initializing JTrello ::::');
    // Förslag på privata metoder
    captureDOMEls();
    createTabs();
    createDialogs();

    bindEvents();

    widgets();
  }

  // All kod här
  return {
    init: init
  };
})();

//usage
$("document").ready(function () {
  jtrello.init();
});
