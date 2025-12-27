<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'password_confirm',
        'referral_code',
        'referral_id',
        'affiliate_id',
        'onboarding_completed',
        'onboarding_step',
        'status',
        'role',
        'fcm_token',
        'subscription_id',
        'membership_type',
        'membership_expires_at',
        'reset_code',
        'reset_code_expires_at',
        'permissions',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'permissions',
    ];

    protected $casts = [
        'permissions'          => 'array',
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'membership_expires_at' => 'datetime',
        'reset_code_expires_at' => 'datetime',
        'onboarding_completed' => 'boolean',
        'onboarding_step' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($user) {
            $user->uuid = Str::uuid();
            $user->referral_code = $user->generateReferralCode();
        });
    }

    public function generateReferralCode()
    {
        return strtoupper(Str::random(8));
    }

    public function onboarding()
    {
        return $this->hasOne(Onboarding::class);
    }

    public function wallet()
    {
        return $this->hasOne(Wallet::class);
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    public function referrer()
    {
        return $this->belongsTo(User::class, 'referral_id');
    }

    public function referrals()
    {
        return $this->hasMany(User::class, 'referral_id');
    }

    public function affiliate()
    {
        return $this->belongsTo(User::class, 'affiliate_id');
    }

    public function affiliates()
    {
        return $this->hasMany(User::class, 'affiliate_id');
    }

    public function referralRewards()
    {
        return $this->hasMany(ReferralReward::class, 'referrer_id');
    }

    public function getWallet($currency = 'USD')
    {
        return $this->wallets()->where('currency', $currency)->where('is_active', true)->first();
    }

    public function widget()
    {
        return $this->hasOne(Widget::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    //in user class
    public function devices()
    {
        return $this->hasMany(UserDevice::class);
    }

    public function aiSetting()
  {
      return $this->hasOne(AiSetting::class);
  }

    public function usersettings()
    {
        return $this->hasOne(UserSetting::class);
    }

    /**
     * Get feature manager for this user
     */
    public function features()
    {
        return new \App\Helpers\FeatureManager($this);
    }

    public function widgets()
    {
        return $this->hasMany(Widget::class);
    }

    public function conversations()
    {
        return $this->hasManyThrough(Conversation::class, Widget::class);
    }

    public function teamMembers()
    {
        return $this->hasMany(TeamMember::class);
    }

    public function featureUsages()
    {
        return $this->hasMany(FeatureUsage::class);
    }
}
