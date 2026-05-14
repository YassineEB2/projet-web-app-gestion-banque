<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AccountController;
use App\Http\Controllers\TransactionController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) { return $request->user(); });

    Route::apiResource('accounts', AccountController::class)->only(['index', 'store']);
    
    Route::post('/transactions/deposit', [TransactionController::class, 'deposit']);
    Route::post('/transactions/withdraw', [TransactionController::class, 'withdraw']);
    Route::post('/transactions/transfer', [TransactionController::class, 'transfer']);
    Route::get('/transactions/history', [TransactionController::class, 'index']);
});
