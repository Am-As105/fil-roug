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

Route::get('/catastrophes', [CatastropheController::class, 'index']);
Route::get('/catastrophes/{catastropheId}', [CatastropheController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/catastrophes', [CatastropheController::class, 'store']);
    Route::match(['put', 'patch'], '/catastrophes/{catastropheId}', [CatastropheController::class, 'update']);
    Route::delete('/catastrophes/{catastropheId}', [CatastropheController::class, 'delete']);
});
