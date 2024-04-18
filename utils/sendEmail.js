import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service:'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.USER,   //SENDER GMAIL ADDRESS
      pass: process.env.APP_PASSWORD //APP PASS FROM GMAIL ACCOUNT
    },
  });




  const mailOptions = {
    from: {
        name:'PAAJI',
        address:process.env.USER
    }, // sender address
    to: '13veeeer@gmail.com', // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  };




  const sendMail = async(transporter,mailOptions) => {
    try{
        await transporter.sendMail(mailOptions);
        console.log('Email has been sent')
    }catch(err){
        console.log(err);
    }
  }


  sendMail(transporter, mailOptions);
// export default sendEmail;