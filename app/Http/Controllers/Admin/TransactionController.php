<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Transaction;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $query = Transaction::with('user', 'wallet', 'subscription')
            ->orderBy('created_at', 'desc');

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by type
        if ($request->has('type') && $request->type !== 'all') {
            $query->where('type', $request->type);
        }

        // Search by reference or user
        if ($request->has('search') && $request->search) {
            $query->where(function($q) use ($request) {
                $q->where('reference', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%')
                  ->orWhereHas('user', function($userQuery) use ($request) {
                      $userQuery->where('name', 'like', '%' . $request->search . '%')
                                ->orWhere('email', 'like', '%' . $request->search . '%');
                  });
            });
        }

        $transactions = $query->paginate(20);

        $stats = [
            'total' => Transaction::count(),
            'completed' => Transaction::where('status', 'completed')->count(),
            'pending' => Transaction::where('status', 'pending')->count(),
            'failed' => Transaction::where('status', 'failed')->count(),
            'cancelled' => Transaction::where('status', 'cancelled')->count(),
            'total_revenue' => Transaction::where('status', 'completed')
                ->whereIn('type', ['subscription', 'deposit'])
                ->sum('amount'),
            'total_refunds' => Transaction::where('status', 'completed')
                ->where('type', 'refund')
                ->sum('amount'),
        ];

        return Inertia::render('Admin/Transactions/Index', [
            'transactions' => $transactions,
            'stats' => $stats,
            'filters' => $request->only(['status', 'type', 'search']),
        ]);
    }

    public function approveRefund(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $refundTransaction = Transaction::findOrFail($id);

            // Validate this is a pending refund
            if ($refundTransaction->type !== 'refund') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This is not a refund transaction'
                ], 400);
            }

            if ($refundTransaction->status !== 'pending') {
                return response()->json([
                    'status' => 'error',
                    'message' => 'This refund has already been processed or is not pending'
                ], 400);
            }

            // Get user and wallet
            $user = User::findOrFail($refundTransaction->user_id);
            $wallet = $user->wallet;

            if (!$wallet) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'User wallet not found'
                ], 404);
            }

            // Check wallet has sufficient balance
            if ($wallet->balance < $refundTransaction->amount) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Insufficient wallet balance. Wallet has {$wallet->currency} {$wallet->balance}, but refund is {$refundTransaction->currency} {$refundTransaction->amount}"
                ], 400);
            }

            $walletBalanceBefore = $wallet->balance;

            // DEBIT from wallet (removing the refund amount we owe)
            $wallet->balance -= $refundTransaction->amount;
            $wallet->save();

            // Update refund transaction metadata
            $metadata = $refundTransaction->metadata ?? [];
            $metadata['approved_at'] = now()->toDateTimeString();
            $metadata['approved_by'] = auth()->id();
            $metadata['admin_notes'] = $request->notes ?? 'Refund approved and processed manually';
            $metadata['wallet_balance_before'] = $walletBalanceBefore;
            $metadata['wallet_balance_after'] = $wallet->balance;

            // Mark refund as completed
            $refundTransaction->status = 'completed';
            $refundTransaction->metadata = $metadata;
            $refundTransaction->save();

            DB::commit();

            Log::info('Refund approved and processed', [
                'refund_id' => $refundTransaction->id,
                'user_id' => $user->id,
                'amount' => $refundTransaction->amount,
                'wallet_balance_before' => $walletBalanceBefore,
                'wallet_balance_after' => $wallet->balance,
                'approved_by' => auth()->id(),
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Refund approved successfully. Amount debited from user wallet.',
                'data' => [
                    'refund_transaction' => $refundTransaction,
                    'wallet_balance' => $wallet->balance,
                    'amount_processed' => $refundTransaction->amount,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Refund approval failed', [
                'transaction_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'status' => 'error',
                'message' => 'Failed to approve refund: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $transaction = Transaction::with('user', 'wallet', 'subscription')->findOrFail($id);

        // Get related refund if exists
        $refund = null;
        if ($transaction->type !== 'refund') {
            $refund = Transaction::where('type', 'refund')
                ->where('metadata->original_transaction', $transaction->reference)
                ->first();
        }

        // Get original transaction if this is a refund
        $originalTransaction = null;
        if ($transaction->type === 'refund' && isset($transaction->metadata['original_transaction_id'])) {
            $originalTransaction = Transaction::find($transaction->metadata['original_transaction_id']);
        }

        return Inertia::render('Admin/Transactions/Show', [
            'transaction' => $transaction,
            'refund' => $refund,
            'originalTransaction' => $originalTransaction,
        ]);
    }

    public function approve(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $transaction = Transaction::with('subscription')->findOrFail($id);

            // Validate this is a pending transaction
            if ($transaction->status !== 'pending') {
                return back()->withErrors([
                    'message' => 'This transaction has already been processed or is not pending'
                ]);
            }

            // Validate transaction type
            if ($transaction->type === 'refund') {
                return back()->withErrors([
                    'message' => 'Please use the refund approval process for refund transactions'
                ]);
            }

            // Get user
            $user = User::findOrFail($transaction->user_id);

            // If this is a subscription transaction, activate the plan
            if ($transaction->type === 'subscription' && $transaction->subscription_id) {
                $subscription = $transaction->subscription;

                if (!$subscription) {
                    return back()->withErrors([
                        'message' => 'Subscription plan not found for this transaction'
                    ]);
                }

                // Calculate expiry date based on subscription duration
                $expiresAt = match($subscription->duration) {
                    'monthly' => now()->addMonth(),
                    'yearly' => now()->addYear(),
                    'lifetime' => null,
                    default => now()->addMonth(),
                };

                // Update user subscription details
                $user->update([
                    'subscription_id' => $subscription->id,
                    'membership_type' => strtolower($subscription->name),
                    'membership_expires_at' => $expiresAt,
                ]);

                Log::info('User subscription activated via manual approval', [
                    'user_id' => $user->id,
                    'subscription_id' => $subscription->id,
                    'transaction_id' => $transaction->id,
                    'expires_at' => $expiresAt,
                ]);
            }

            // Update transaction metadata
            $metadata = $transaction->metadata ?? [];
            $metadata['approved_at'] = now()->toDateTimeString();
            $metadata['approved_by'] = auth()->id();
            $metadata['admin_notes'] = $request->notes ?? 'Manually approved by admin';

            // Mark transaction as completed
            $transaction->status = 'completed';
            $transaction->metadata = $metadata;
            $transaction->save();

            DB::commit();

            Log::info('Transaction approved', [
                'transaction_id' => $transaction->id,
                'user_id' => $user->id,
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'approved_by' => auth()->id(),
            ]);

            return back()->with('success', 'Transaction approved successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction approval failed', [
                'transaction_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'message' => 'Failed to approve transaction: ' . $e->getMessage()
            ]);
        }
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            $transaction = Transaction::findOrFail($id);

            // Validate this is a pending transaction
            if ($transaction->status !== 'pending') {
                return back()->withErrors([
                    'message' => 'This transaction has already been processed or is not pending'
                ]);
            }

            // Update transaction metadata
            $metadata = $transaction->metadata ?? [];
            $metadata['rejected_at'] = now()->toDateTimeString();
            $metadata['rejected_by'] = auth()->id();
            $metadata['rejection_reason'] = $request->notes ?? 'Manually rejected by admin';

            // Mark transaction as rejected
            $transaction->status = 'rejected';
            $transaction->metadata = $metadata;
            $transaction->save();

            DB::commit();

            Log::info('Transaction rejected', [
                'transaction_id' => $transaction->id,
                'user_id' => $transaction->user_id,
                'type' => $transaction->type,
                'amount' => $transaction->amount,
                'rejected_by' => auth()->id(),
                'reason' => $request->notes,
            ]);

            return back()->with('success', 'Transaction rejected successfully');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Transaction rejection failed', [
                'transaction_id' => $id,
                'error' => $e->getMessage(),
            ]);

            return back()->withErrors([
                'message' => 'Failed to reject transaction: ' . $e->getMessage()
            ]);
        }
    }
}
