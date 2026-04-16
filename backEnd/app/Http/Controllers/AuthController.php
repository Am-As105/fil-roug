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

    public function login(Request $request)
    {
            $user = User::where('email', $request->email)->first();
            if(!$user)
            {
                 return response()->json(['message' => 'User not found'], 404);
            }
             if (!Hash::check($request->password, $user->password))
            {
                return response()->json(['message' => 'Password incorrect'], 401);
            }

            $token = $user->createToken('auth_token')->plainTextToken;
            return response()->json(['user' => $user, 'token' => $token]    );
            
    }


    
    

    
}
