<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Code</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; line-height: 1.6;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; border-bottom: 1px solid #e6ebf1;">
                            <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #32325d;">
                                {{ $appName }}
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">

                            <!-- Title -->
                            <h2 style="margin: 0 0 16px; font-size: 20px; font-weight: 600; color: #32325d;">
                                Password Reset Request
                            </h2>

                            <!-- Greeting -->
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #525f7f;">
                                Hello <strong style="color: #32325d;">{{ $userName }}</strong>,
                            </p>

                            <p style="margin: 0 0 32px; font-size: 15px; line-height: 24px; color: #525f7f;">
                                We received a request to reset your password. Use the verification code below to proceed:
                            </p>

                            <!-- Verification Code Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; border-radius: 8px; margin-bottom: 32px;">
                                <tr>
                                    <td style="padding: 32px; text-align: center;">
                                        <p style="margin: 0 0 8px; font-size: 13px; font-weight: 500; color: #8898aa; text-transform: uppercase; letter-spacing: 0.5px;">
                                            Verification Code
                                        </p>
                                        <p style="margin: 0; font-size: 40px; font-weight: 700; color: #32325d; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                            {{ $resetCode }}
                                        </p>
                                        <p style="margin: 12px 0 0; font-size: 13px; color: #f5222d; font-weight: 500;">
                                            Expires in {{ $expiryMinutes }} minutes
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Warning Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 16px;">
                                        <p style="margin: 0 0 8px; font-size: 13px; font-weight: 600; color: #92400e;">
                                            Important Security Notice
                                        </p>
                                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #92400e;">
                                            If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Tips -->
                            <p style="margin: 0 0 12px; font-size: 14px; font-weight: 600; color: #32325d;">
                                For your security:
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="padding: 4px 0;">
                                        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #525f7f;">
                                            • Never share this code with anyone
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0;">
                                        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #525f7f;">
                                            • {{ $appName }} will never ask for your password via email
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 4px 0;">
                                        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #525f7f;">
                                            • This code expires in {{ $expiryMinutes }} minutes
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #f6f9fc; border-top: 1px solid #e6ebf1;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 8px; font-size: 12px; line-height: 18px; color: #8898aa;">
                                            {{ $appName }} &copy; {{ date('Y') }}
                                        </p>
                                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #8898aa;">
                                            If you have any questions, please contact our support team.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
