<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $accounts = $request->user()->accounts()->pluck('id');
        $transactions = \App\Models\Transaction::whereIn('account_id', $accounts)
            ->with(['referenceAccount:id,account_number'])
            ->latest()
            ->get();
        return response()->json($transactions);
    }

    public function deposit(Request $request)
    {
        $request->validate(['account_id' => 'required|exists:accounts,id', 'amount' => 'required|numeric|min:1']);
        $account = $request->user()->accounts()->findOrFail($request->account_id);
        
        DB::transaction(function() use ($account, $request) {
            $account->increment('balance', $request->amount);
            $account->transactions()->create(['type' => 'deposit', 'amount' => $request->amount]);
        });
        return response()->json(['message' => 'Deposit successful', 'balance' => $account->fresh()->balance]);
    }

    public function withdraw(Request $request)
    {
        $request->validate(['account_id' => 'required|exists:accounts,id', 'amount' => 'required|numeric|min:1']);
        $account = $request->user()->accounts()->findOrFail($request->account_id);
        
        if ($account->balance < $request->amount) {
            return response()->json(['message' => 'Insufficient funds'], 400);
        }

        DB::transaction(function() use ($account, $request) {
            $account->decrement('balance', $request->amount);
            $account->transactions()->create(['type' => 'withdrawal', 'amount' => $request->amount]);
        });
        return response()->json(['message' => 'Withdrawal successful', 'balance' => $account->fresh()->balance]);
    }

    public function transfer(Request $request)
    {
        $request->validate([
            'from_account_id' => 'required|exists:accounts,id',
            'to_account_number' => 'required|exists:accounts,account_number',
            'amount' => 'required|numeric|min:1'
        ]);

        $fromAccount = $request->user()->accounts()->findOrFail($request->from_account_id);
        $toAccount = Account::where('account_number', $request->to_account_number)->first();

        if ($fromAccount->id === $toAccount->id) {
            return response()->json(['message' => 'Cannot transfer to the same account'], 400);
        }

        if ($fromAccount->balance < $request->amount) {
            return response()->json(['message' => 'Insufficient funds'], 400);
        }

        DB::transaction(function() use ($fromAccount, $toAccount, $request) {
            $fromAccount->decrement('balance', $request->amount);
            $toAccount->increment('balance', $request->amount);

            $fromAccount->transactions()->create([
                'type' => 'transfer',
                'amount' => $request->amount,
                'reference_account_id' => $toAccount->id
            ]);
            
            $toAccount->transactions()->create([
                'type' => 'transfer',
                'amount' => $request->amount,
                'reference_account_id' => $fromAccount->id
            ]);
        });
        
        return response()->json(['message' => 'Transfer successful', 'balance' => $fromAccount->fresh()->balance]);
    }
}
