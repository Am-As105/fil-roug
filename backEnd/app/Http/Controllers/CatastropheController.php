<?php

namespace App\Http\Controllers;

use App\Models\Catastrophe;
use Illuminate\Http\Request;

class CatastropheController extends Controller
{
    //
    public function index()
    {
        $catastrophes = Catastrophe::with('type')->get();

        return response()->json($catastrophes);

    }
    public function store(Request $request )
    {
        $catastrophe = Catastrophe::create([
            'title' => $request->title,
            'description' => $request->description,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'date' => $request->date,
            'severity' => $request->severity,
            'status' => $request->status,
            'type_id' => $request->type_id,
            
        ]);

        return response()->json($catastrophe);
    }


    // public function delete($catastropheId)
    // {
    //     $catastrophe = Catastrophe::find($catastropheId);
    //     $catastrophe->delete();
    //     return response()->json(['message' => 'deleted']);
    // }
}
