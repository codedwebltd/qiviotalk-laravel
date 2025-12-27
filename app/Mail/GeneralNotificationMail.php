<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class GeneralNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $message;

    public function __construct($message)
    {
        $this->message = $message;
    }

    public function build()
    {
        return $this->subject($this->message['subject'] ?? 'Notification')
                    ->view('emails.general-notification')
                    ->with([
                        'messageData' => $this->message,
                        'appName' => config('app.name'),
                    ]);
    }
}
