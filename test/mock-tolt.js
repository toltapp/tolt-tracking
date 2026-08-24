// A stand-in for the real cdn.tolt.io/tolt.js, so the e2e is deterministic and
// doesn't touch Tolt's backend. It mimics the two things the real script exposes:
// window.tolt_data (populated when the visit has a ?ref) and window.tolt.signup().
(function () {
  var ref = new URLSearchParams(location.search).get("ref");
  window.tolt_data = ref
    ? {
        click_id: "clk_mock_123",
        partner_id: "part_mock_456",
        program_id: "prg_mock_789",
        cookie_duration: 30,
        customer_id: null,
      }
    : null;

  window.tolt = {
    signup: function (identifier) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          if (window.tolt_data) window.tolt_data.customer_id = "cus_mock_abc";
          resolve({
            click_id: "clk_mock_123",
            customer_id: "cus_mock_abc",
            customer_identifier: identifier,
            partner_id: "part_mock_456",
            program_id: "prg_mock_789",
            message: "Success",
          });
        }, 40);
      });
    },
  };
})();
