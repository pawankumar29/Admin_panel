var swig = require("swig");
var nodemailer = require("nodemailer");
const env = require("../env");
// create  smtp transport
var smtpTransport = nodemailer.createTransport(env.smtp);
// send mail
exports.send = async function (to, subject, content) {
    try{
        console.log(env.smtp)
  console.log(to, "=====================to");
  var tpl_swig = swig.compileFile("public/mail_page/index.html");
  var template = tpl_swig({
    content: content,
    logo_path: env.adminUrl + global.logo_path,
  });
  let data = await smtpTransport
    .sendMail({
      from: global.config.admin_email, // sender address from configuration collection
      to: to, // user email_id
      subject: subject, // Subject line
      html: template,
    })
    console.log(data)
    // .then((info) => console.log("-------email sent!", info))
    // .catch((err) => console.log("MAIL ERROR:", err));
  return data;
}catch(err){
    console.log(err)
}
};

// exports.send = function (to, subject, content) {
//     console.log("to   ",to);
//     var tpl_swig = swig.compileFile('public/mail_page/index.html');
//     var template = tpl_swig({content: content, logo_path: env.adminUrl + global.logo_path});
//     console.log(env.adminUrl + global.logo_path);
//     smtpTransport.sendMail({
//         from: global.config.admin_email, // sender address from configuration collection
//         to: to, // user email_id
//         subject: subject, // Subject line
//         html: template
//     }, function (mailError, info) {
//         if (!mailError) {

//             console.log(info);
//             console.log('mail_info ' + info.messageId);
//         } else {
//             console.log(mailError);
//         }
//     });
//     return 1;
// };

// send mail
exports.send_with_attachment = function (
  to,
  subject,
  content,
  pdf_name,
  pdfData
) {
  var tpl_swig = swig.compileFile("public/mail_page/index.html");
  var template = tpl_swig({
    content: content,
    logo_path: env.adminUrl + "images/logo.png",
  });
  smtpTransport.sendMail(
    {
      from: config.admin_email, // sender address from configuration collection
      to: to, // user email_id
      subject: subject, // Subject line
      html: template,
      attachments: [{ filename: pdf_name, content: pdfData }],
    },
    function (mailError, info) {
      if (!mailError) {
        console.log("mail_info " + info.messageId);
      } else {
        console.log(mailError);
      }
    }
  );
  return 1;
};

exports.send_to_all = function (code_info, email_array, subject, content) {
  var tpl_swig = swig.compileFile("public/mail_page/index.html");
  var template;
  for (var i = 0; i < email_array.length; i++) {
    console.log(email_array[i].email);
    content = content.replace("@cust_name@", email_array[i].name);
    template = tpl_swig({
      content: content,
      logo_path: env.adminUrl + "images/logo.png",
    });
    smtpTransport.sendMail(
      {
        from: config.admin_email, // sender address from configuration collection
        to: email_array[i].email, // user email_id
        subject: subject, // Subject line
        html: template,
      },
      function (mailError, info) {
        if (!mailError) {
          console.log("promo code mail_info " + info.messageId);
        } else {
          console.log(mailError);
        }
      }
    );
  }
  return 1;
};
