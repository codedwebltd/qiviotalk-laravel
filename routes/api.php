<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TokenController;
use App\Http\Controllers\Api\WidgetController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\FirebaseProxyController;
use App\Http\Controllers\Api\ReactLoginController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\UserSettingsController;
use App\Http\Controllers\Api\ReactRegisterController;
use App\Http\Controllers\Api\ReactOnboardingController;
use App\Http\Controllers\Api\WidgetAnalyticsController;
use App\Http\Controllers\Api\ConversationUpdateController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\VersionCheckController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PaymentApiController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/


// Public routes
Route::post('/register', [ReactRegisterController::class, 'register']);
Route::post('/login', [ReactLoginController::class, 'login']);
Route::post('/widgets/verify', [WidgetController::class, 'verifyInstallation']);

// Password reset routes (public)
Route::post('/password/forgot', [PasswordResetController::class, 'forgotPassword']);
Route::post('/password/verify-code', [PasswordResetController::class, 'verifyCode']);
Route::post('/password/reset', [PasswordResetController::class, 'resetPassword']);
Route::post('/password/resend-code', [PasswordResetController::class, 'resendCode']);

// Version check (no auth required)
Route::post('/version/check', [VersionCheckController::class, 'checkVersion']);


// Public chat API routes (no authentication required)
Route::post('/widgets/conversations/start', [ConversationController::class, 'start']);
Route::post('/widgets/messages/send', [MessageController::class, 'sendFromVisitor']);
Route::get('/widgets/conversations/visitor', [ConversationController::class, 'getVisitorHistory']);
Route::get('/widgets/messages/visitor', [MessageController::class, 'getVisitorMessages']);

// New route for updating visitor info
Route::post('/widgets/conversations/update', [ConversationUpdateController::class, 'updateVisitorInfo']);
Route::post('/widgets/conversations/rate', [ConversationController::class, 'rateConversation']);
Route::post('/widgets/conversations/close', [ConversationController::class, 'closeFromVisitor']);

Route::post('/widgets/chat-activity', [WidgetAnalyticsController::class, 'recordHeartbeat']);
Route::get('/widgets/conversations/status', [ConversationController::class, 'getStatus']);

Route::post('/widgets/typing', [MessageController::class, 'typing']);

Route::post('/widgets/new-connection', [MessageController::class, 'newconnection']);

// NEW: Get domain-specific context (company name)
Route::get('/widgets/{widgetKey}/domain-context', [WidgetController::class, 'getDomainContext']);


Route::get('/firebase-proxy', [FirebaseProxyController::class, 'proxy']);
Route::post('/firebase-proxy', [FirebaseProxyController::class, 'proxy']);

// Cryptomus webhook (public - no auth required)
Route::post('/crypto/webhook', [PaymentApiController::class, 'handleCryptomusWebhook'])->name('api.crypto.webhook');



// Protected routes
Route::middleware('auth:api')->group(function () {
    // Token validation route
    Route::get('/validate-token', [TokenController::class, 'validateToken']);
    
    // Logout route
    Route::post('/logout', [ReactLoginController::class, 'logout']); 
    Route::post('/fcm-token', [ReactLoginController::class, 'updateFcmToken']);
    
    // Onboarding routes
    Route::post('/onboarding/update', [ReactOnboardingController::class, 'updateStep']);
    Route::get('/onboarding', [ReactOnboardingController::class, 'getOnboarding']);
    Route::post('/onboarding/skip', [ReactOnboardingController::class, 'skipOnboarding']);

    Route::post('/settings/update', [UserSettingsController::class, 'updateSettings']);
    Route::post('/ai/agent/update', [UserSettingsController::class, 'aiAgentSettings']);
    Route::get('/user/profile', [UserSettingsController::class, 'userprofile']);
    Route::post('/website-context/update', [UserSettingsController::class, 'updateWebsiteContext']);

    // Notification routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'delete']);
    Route::delete('/notifications', [NotificationController::class, 'deleteAll']);

    // Subscription routes
    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::post('/subscription/purchase', [SubscriptionController::class, 'purchase']);
    Route::post('/subscription/renew', [SubscriptionController::class, 'renew']);

    // App version management (admin)
    Route::get('/versions', [VersionCheckController::class, 'index']);
    Route::post('/versions', [VersionCheckController::class, 'store']);
    Route::put('/versions/{id}', [VersionCheckController::class, 'update']);
    Route::delete('/versions/{id}', [VersionCheckController::class, 'destroy']);

    // Widget routes
    Route::get('/widget', [WidgetController::class, 'getWidget']);
    Route::put('/widget', [WidgetController::class, 'updateWidget']);
    
    //Protected chat routes (authentication required)
    //Conversation routes
    Route::get('/conversations', [ConversationController::class, 'list']);
    Route::get('/conversations/{id}', [ConversationController::class, 'get']);
    Route::post('/conversations/{id}/close', [ConversationController::class, 'close']);
    Route::post('/conversations/{id}/reopen', [ConversationController::class, 'reopen']);
    Route::post('/conversations/{id}/archive', [ConversationController::class, 'archive']);

    // Message routes
    Route::get('/conversations/{conversationId}/messages', [MessageController::class, 'getMessages']);
    Route::post('/conversations/{conversationId}/messages', [MessageController::class, 'sendFromAgent']);

    // agent auth typing..
    Route::post('/typing', [MessageController::class, 'agentTyping']);

    // Cryptomus payment routes (authentication required)
    Route::post('/crypto/payment', [PaymentApiController::class, 'createCryptomusPayment'])->name('api.createCryptomusPayment');
    Route::post('/crypto/payment/status', [PaymentApiController::class, 'checkPaymentStatus'])->name('api.crypto.payment.status');
    Route::post('/transaction/cancel', [PaymentApiController::class, 'cancelPayment'])->name('api.crypto.cancel.payment');

});



