<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public $resetCode;
    public $userName;

    public function __construct($resetCode, $userName)
    {
        $this->resetCode = $resetCode;
        $this->userName = $userName;
    }

    public function build()
    {
        return $this->subject('Password Reset Code - ' . config('app.name'))
                    ->view('emails.password-reset')
                    ->with([
                        'resetCode' => $this->resetCode,
                        'userName' => $this->userName,
                        'appName' => config('app.name'),
                        'expiryMinutes' => 15,
                    ]);
    }
}
