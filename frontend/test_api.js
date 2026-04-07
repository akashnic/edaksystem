const axios = require('axios');
async function test() {
  try {
    const res = await axios.get('http://localhost:8000/api/dispatch/');
    console.log(res.data);
    if(res.data.length > 0 || res.data.results?.length > 0) {
      const id = res.data.results ? res.data.results[0].dispatch_id : res.data[0].dispatch_id;
      const putRes = await axios.put(`http://localhost:8000/api/dispatch/${id}/mark-received/`, {
        receiver_name: "Test",
        mobile_number: "123",
        signature_image: "test_sig"
      });
      console.log("PUT SUCCESS:", putRes.data);
    }
  } catch(e) {
    console.error("PUT FAIL:", e.response ? e.response.data : e.message);
  }
}
test();
