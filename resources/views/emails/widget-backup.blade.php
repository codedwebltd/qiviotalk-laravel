<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget Backup Notification</title>
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
                                {{ config('app.name') }}
                            </h1>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">

                            <!-- Greeting -->
                            <p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #32325d;">
                                Hello {{ $user_name }},
                            </p>

                            <!-- Subject/Title -->
                            <h2 style="margin: 0 0 24px; font-size: 20px; font-weight: 600; color: #32325d;">
                                Widget Backup - Scheduled Cleanup
                            </h2>

                            <!-- Warning Box -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 4px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 12px; font-size: 15px; line-height: 24px; color: #92400e; font-weight: 600;">
                                            Your widget has been removed due to inactivity
                                        </p>
                                        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #92400e;">
                                            Widget "<strong>{{ $widget_name }}</strong>" has not been verified for over 1 month and has been removed from our system.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Backup Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #eff6ff; border-radius: 4px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 12px; font-size: 15px; line-height: 24px; color: #1e40af; font-weight: 600;">
                                            Backup Information
                                        </p>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 4px 0;">
                                                    <span style="font-size: 13px; color: #1e40af;">Widget Name:</span>
                                                </td>
                                                <td style="padding: 4px 0; text-align: right;">
                                                    <strong style="font-size: 13px; color: #1e40af;">{{ $widget_name }}</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0;">
                                                    <span style="font-size: 13px; color: #1e40af;">Conversations Backed Up:</span>
                                                </td>
                                                <td style="padding: 4px 0; text-align: right;">
                                                    <strong style="font-size: 13px; color: #1e40af;">{{ $conversations_count }}</strong>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 4px 0;">
                                                    <span style="font-size: 13px; color: #1e40af;">Deletion Date:</span>
                                                </td>
                                                <td style="padding: 4px 0; text-align: right;">
                                                    <strong style="font-size: 13px; color: #1e40af;">{{ $deletion_date }}</strong>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Attachment Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 4px; margin-bottom: 24px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <p style="margin: 0 0 8px; font-size: 14px; line-height: 22px; color: #166534;">
                                            📎 <strong>Backup File Attached</strong>
                                        </p>
                                        <p style="margin: 0; font-size: 13px; line-height: 20px; color: #166534;">
                                            Your conversation history has been backed up and attached to this email as a JSON file. Please download and save this file for your records.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Next Steps -->
                            <div style="margin: 24px 0;">
                                <p style="margin: 0 0 12px; font-size: 15px; line-height: 24px; color: #32325d; font-weight: 600;">
                                    What's Next?
                                </p>
                                <ul style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 22px; color: #6b7280;">
                                    <li style="margin-bottom: 8px;">If you'd like to continue using our chat widget, please create a new widget and install it on your website.</li>
                                    <li style="margin-bottom: 8px;">Make sure to verify your widget installation regularly to prevent automatic removal.</li>
                                    <li>Contact our support team if you have any questions or need assistance.</li>
                                </ul>
                            </div>

                            <!-- Support Text -->
                            <p style="margin: 24px 0 0; font-size: 14px; line-height: 22px; color: #6b7280;">
                                If you believe this was a mistake or need help, please contact our support team.
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 40px; background-color: #f6f9fc; border-top: 1px solid #e6ebf1;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <p style="margin: 0 0 8px; font-size: 12px; line-height: 18px; color: #8898aa;">
                                            {{ config('app.name') }} &copy; {{ date('Y') }}
                                        </p>
                                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #8898aa;">
                                            This is an automated notification. Please do not reply to this email.
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
