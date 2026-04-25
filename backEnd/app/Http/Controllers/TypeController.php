<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class TypeController extends Controller
{
    public function index()
    {
        return response()->json(Type::all());
    } 
}
