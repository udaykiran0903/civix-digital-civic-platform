const getVerificationEmailTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification - Civix</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f6f8;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 0;">
          <table width="500" style="background:#ffffff; border-radius:8px; padding:30px;">
            
            <tr>
              <td align="center">
                <h2 style="color:#2c3e50;">Civix Email Verification</h2>
                <p style="color:#555; font-size:14px;">
                  Welcome to <b>Civix</b>. Please verify your email address.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:20px 0;">
                <div style="
                  padding:15px 30px;
                  font-size:24px;
                  letter-spacing:4px;
                  font-weight:bold;
                  background:#f1f3f6;
                  border-radius:6px;
                  display:inline-block;">
                  ${otp}
                </div>
              </td>
            </tr>

            <tr>
              <td align="center">
                <p style="color:#777; font-size:13px;">
                  This OTP will expire in 5 minutes.
                </p>
                <p style="color:#999; font-size:12px;">
                  If you didn’t request this, you can safely ignore this email.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-top:30px;">
                <p style="font-size:12px; color:#bbb;">
                  © ${new Date().getFullYear()} Civix. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};


const getWelcomeEmailTemplate = (name) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Welcome to Civix</title>
  </head>
  <body style="margin:0; padding:0; background-color:#f2f4f8; font-family:Arial, sans-serif;">
    
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 15px;">
          
          <table width="600" cellpadding="0" cellspacing="0" 
            style="background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 25px rgba(0,0,0,0.08);">

            <!-- Gradient Header -->
            <tr>
              <td align="center" 
                style="background:linear-gradient(135deg,#1e3c72,#2a5298); padding:40px 20px; color:white;">
                <h1 style="margin:0; font-size:28px;"> Welcome to Civix</h1>
                <p style="margin:10px 0 0 0; font-size:15px; opacity:0.9;">
                  Your voice now has power.
                </p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px 30px; text-align:center;">
                <h2 style="margin-top:0; color:#333;">
                  Hi ${name},
                </h2>

                <p style="color:#555; font-size:16px; line-height:1.6;">
                  Your email has been successfully verified.  
                  You’re now officially part of the Civix community.
                </p>

                <p style="color:#555; font-size:15px;">
                  Start creating petitions, support meaningful causes,
                  and make an impact today.
                </p>

                <!-- Button -->
                <div style="margin:30px 0;">
                  <a href="#"
                    style="
                      background:linear-gradient(135deg,#1e3c72,#2a5298);
                      color:white;
                      padding:14px 30px;
                      text-decoration:none;
                      font-size:16px;
                      border-radius:30px;
                      display:inline-block;
                      font-weight:bold;
                      box-shadow:0 4px 10px rgba(0,0,0,0.15);
                    ">
                    Explore Civix
                  </a>
                </div>

                <p style="font-size:13px; color:#888;">
                  If you have any questions, feel free to reply to this email.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" 
                style="background:#f7f9fc; padding:20px; font-size:12px; color:#999;">
                © ${new Date().getFullYear()} Civix. All rights reserved.
                <br/>
                Empowering citizens through collective action.
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </body>
  </html>
  `;
};
module.exports = { getVerificationEmailTemplate ,getWelcomeEmailTemplate};