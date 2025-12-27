<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Admin\ConversationController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\WidgetController;
use App\Http\Controllers\Admin\LogController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Admin\TransactionController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\AppVersionController;
use App\Http\Controllers\Admin\SettingsController;

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Here is where you can register admin routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them
| will be assigned to the "web" middleware group with "auth" and "admin"
| middleware applied.
|
*/

Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/conversations', [ConversationController::class, 'index'])->name('conversations.index');
Route::get('/conversations/{id}', [ConversationController::class, 'show'])->name('conversations.show');
Route::post('/conversations/{id}/messages', [ConversationController::class, 'sendMessage'])->name('conversations.sendMessage');
Route::get('/conversations/{id}/messages', [ConversationController::class, 'getMessages'])->name('conversations.getMessages');
Route::post('/conversations/{id}/close', [ConversationController::class, 'close'])->name('conversations.close');
Route::post('/conversations/{id}/reopen', [ConversationController::class, 'reopen'])->name('conversations.reopen');

Route::get('/widgets', [WidgetController::class, 'index'])->name('widgets.index');
Route::post('/widgets/bulk-update', [WidgetController::class, 'bulkUpdate'])->name('widgets.bulkUpdate');
Route::post('/widgets/update-all', [WidgetController::class, 'updateAll'])->name('widgets.updateAll');
Route::post('/widgets/{id}/update', [WidgetController::class, 'updateWidget'])->name('widgets.update');
Route::post('/widgets/{id}/status', [WidgetController::class, 'updateStatus'])->name('widgets.status');

Route::get('/logs', [LogController::class, 'index'])->name('logs.index');
Route::post('/logs/clear', [LogController::class, 'clear'])->name('logs.clear');

Route::get('/subscriptions', [SubscriptionController::class, 'index'])->name('subscriptions.index');
Route::get('/subscriptions/create', [SubscriptionController::class, 'create'])->name('subscriptions.create');
Route::post('/subscriptions', [SubscriptionController::class, 'store'])->name('subscriptions.store');
Route::get('/subscriptions/{subscription}/edit', [SubscriptionController::class, 'edit'])->name('subscriptions.edit');
Route::put('/subscriptions/{subscription}', [SubscriptionController::class, 'update'])->name('subscriptions.update');
Route::post('/subscriptions/{subscription}/toggle', [SubscriptionController::class, 'toggleActive'])->name('subscriptions.toggle');
Route::delete('/subscriptions/{subscription}', [SubscriptionController::class, 'destroy'])->name('subscriptions.destroy');

Route::get('/transactions', [TransactionController::class, 'index'])->name('transactions.index');
Route::get('/transactions/{id}', [TransactionController::class, 'show'])->name('transactions.show');
Route::post('/transactions/{id}/approve', [TransactionController::class, 'approve'])->name('transactions.approve');
Route::post('/transactions/{id}/reject', [TransactionController::class, 'reject'])->name('transactions.reject');
Route::post('/transactions/{id}/approve-refund', [TransactionController::class, 'approveRefund'])->name('transactions.approveRefund');

Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead'])->name('notifications.markAsRead');
Route::post('/notifications/mark-all-as-read', [NotificationController::class, 'markAllAsRead'])->name('notifications.markAllAsRead');
Route::delete('/notifications/{id}', [NotificationController::class, 'destroy'])->name('notifications.destroy');
Route::delete('/notifications/read', [NotificationController::class, 'destroyRead'])->name('notifications.destroyRead');

Route::get('/users', [UserController::class, 'index'])->name('users.index');
Route::get('/users/{id}', [UserController::class, 'show'])->name('users.show');
Route::get('/users/{id}/conversations', [UserController::class, 'conversations'])->name('users.conversations');
Route::delete('/users/{id}/conversations/{conversationId}', [UserController::class, 'deleteConversation'])->name('users.deleteConversation');
Route::post('/users/{id}/conversations/bulk-delete', [UserController::class, 'bulkDeleteConversations'])->name('users.bulkDeleteConversations');
Route::post('/users', [UserController::class, 'store'])->name('users.store');
Route::post('/users/{id}/role', [UserController::class, 'updateRole'])->name('users.updateRole');
Route::post('/users/{id}/status', [UserController::class, 'updateStatus'])->name('users.updateStatus');
Route::post('/users/{id}/credit', [UserController::class, 'creditWallet'])->name('users.creditWallet');
Route::post('/users/{id}/debit', [UserController::class, 'debitWallet'])->name('users.debitWallet');
Route::post('/users/{id}/toggle-widget', [UserController::class, 'toggleWidget'])->name('users.toggleWidget');
Route::post('/users/{id}/change-plan', [UserController::class, 'changePlan'])->name('users.changePlan');

Route::get('/app-versions', [AppVersionController::class, 'index'])->name('app-versions.index');
Route::post('/app-versions/upload-file', [AppVersionController::class, 'uploadFile'])->name('app-versions.uploadFile');
Route::post('/app-versions', [AppVersionController::class, 'store'])->name('app-versions.store');
Route::put('/app-versions/{id}', [AppVersionController::class, 'update'])->name('app-versions.update');
Route::post('/app-versions/{id}', [AppVersionController::class, 'update'])->name('app-versions.update.post');
Route::post('/app-versions/{id}/toggle-active', [AppVersionController::class, 'toggleActive'])->name('app-versions.toggleActive');
Route::post('/app-versions/{id}/toggle-mandatory', [AppVersionController::class, 'toggleMandatory'])->name('app-versions.toggleMandatory');
Route::delete('/app-versions/{id}', [AppVersionController::class, 'destroy'])->name('app-versions.destroy');

Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');
