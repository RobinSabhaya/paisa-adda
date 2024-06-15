const { generateMessage } = require('../helper/function.helper');

const responseHandler = (req, res, next) => {
  const originalSend = res.send; // Intercept the response object.

  // Override the send function to access the response data.
  res.send = function (body) {
    let responseData = JSON.parse(body); // Access the response responseData here.

    if (Array.isArray(responseData.message)) {
      const [validation, attribute = ''] = responseData.message;

      responseData.message = generateMessage(validation, attribute);
    }

    body = JSON.stringify(responseData);

    originalSend.apply(res, arguments); // Call the original send function.
  };
  next();
};

module.exports = {
  responseHandler,
};
