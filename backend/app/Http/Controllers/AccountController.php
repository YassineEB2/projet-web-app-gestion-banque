<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Account;
use Illuminate\Support\Str;

class AccountController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->accounts;
    }

    public function store(Request $request)
    {
        $account = $request->user()->accounts()->create([
            'account_number' => strtoupper(Str::random(10)),
            'balance' => 0.00
        ]);
        return response()->json($account, 201);
    }
}
