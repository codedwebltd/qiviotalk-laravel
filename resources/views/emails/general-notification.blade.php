<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $messageData['subject'] ?? 'Notification' }}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(180deg, #fafbfc 0%, #f0f2f5 100%);">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 60px 20px;">
        <tr>
            <td align="center">
                
                <!-- Brand Strip -->
                <table width="560" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                    <tr>
                        <td style="text-align: left;">
                            @php
                                $type = $messageData['type'] ?? 'info';
                                $brandColors = [
                                    'success' => '#10b981',
                                    'error' => '#ef4444',
                                    'warning' => '#f59e0b',
                                    'info' => '#6366f1',
                                ];
                                $brand = $brandColors[$type] ?? $brandColors['info'];
                            @endphp
                            <div style="display: inline-block; padding: 8px 16px; background-color: {{ $brand }}; border-radius: 6px;">
                                <span style="font-size: 14px; font-weight: 600; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase;">
                                    {{ $appName }}
                                </span>
                            </div>
                        </td>
                    </tr>
                </table>

                <!-- Main Card -->
                <table width="560" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);">
                    
                    <!-- Accent Bar -->
                    <tr>
                        <td style="height: 4px; background-color: {{ $brand }}; border-radius: 16px 16px 0 0;"></td>
                    </tr>

                    <!-- Content Area -->
                    <tr>
                        <td style="padding: 48px 40px;">

                            <!-- Title -->
                            <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #111827; line-height: 1.3; letter-spacing: -0.02em;">
                                {{ $messageData['subject'] ?? 'Notification' }}
                            </h1>

                            <!-- Message Content -->
                            <div style="margin-bottom: 32px;">
                                <p style="margin: 0; font-size: 16px; line-height: 28px; color: #374151;">
                                    {!! nl2br(e($messageData['response'] ?? $messageData['message'] ?? '')) !!}
                                </p>
                            </div>

                            <!-- Details Card (Optional) -->
                            @if(isset($messageData['details']) && !empty($messageData['details']))
                            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%); border-radius: 12px; margin-bottom: 32px; border: 1px solid #e5e7eb;">
                                <tr>
                                    <td style="padding: 24px;">
                                        <p style="margin: 0; font-size: 14px; line-height: 24px; color: #6b7280;">
                                            <strong style="color: #374151; font-weight: 600;">Additional Information:</strong><br>
                                            {{ $messageData['details'] }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Divider -->
                            <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%); margin: 32px 0;"></div>

                            <!-- Support Message -->
                            <p style="margin: 0; font-size: 14px; line-height: 24px; color: #6b7280; text-align: center;">
                                Need assistance? Our support team is here to help you anytime.
                            </p>

                        </td>
                    </tr>

                </table>

                <!-- Footer -->
                <table width="560" cellpadding="0" cellspacing="0" border="0" style="margin-top: 32px;">
                    <tr>
                        <td style="text-align: center; padding: 0 20px;">
                            <p style="margin: 0 0 8px; font-size: 13px; line-height: 20px; color: #9ca3af;">
                                <strong style="color: #6b7280;">{{ $appName }}</strong> © {{ date('Y') }} · All rights reserved
                            </p>
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af;">
                                This message was sent automatically. Please don't reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>