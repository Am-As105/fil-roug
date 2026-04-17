<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CatastropheController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);



Route::post('/catastrophes', [CatastropheController::class, 'store'])->middleware('auth:sanctum');
Route::get('/catastrophes', [CatastropheController::class, 'index'])->middleware('auth:sanctum');
Route::get('/catastrophes/{catastropheId}', [CatastropheController::class, 'delete'])->middleware('auth:sanctum');