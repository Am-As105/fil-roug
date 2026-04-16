<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{

        public function  register(Request $request)
        {
            $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            
            'name' => $request->name,
            'email'=> $request->email,
            'password'=> Hash::make($request->password)
        ]);
        
        return response()->json($user);
    }


    
    

    
}
