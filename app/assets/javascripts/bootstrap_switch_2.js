!function ($) {

  "use strict"; // jshint ;_;


 /* SWITCH PUBLIC CLASS DEFINITION
  * ============================== */

  var Switch = function (element, options) {
    this.$element = $(element)
  }

  Switch.prototype.setState = function (state) {
    this.$element
      .toggleClass('active', state)
      .find(':checkbox').attr('checked', state)
  }

  Switch.prototype.toggle = function () {
    this.$element
      .toggleClass('active')
      .find(':checkbox').attr('checked', this.$element.hasClass('active'))
  }


 /* SWITCH PLUGIN DEFINITION
  * ======================== */

  $.fn.switch = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('switch')
      if (!data) $this.data('switch', (data = new Switch(this)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }

  $.fn.switch.Constructor = Switch


 /* SWITCH DATA-API
  * =============== */

  $(function () {
    $('body').on('click.switch.data-api', '[data-toggle^=switch]', function (e) {
      var $switch = $(e.target)
      if (!$switch.hasClass('switch')) $switch = $switch.closest('.switch')
      $switch.switch('toggle')
      return false
    })
  })
}(window.jQuery);

