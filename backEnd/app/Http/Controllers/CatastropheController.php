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

         $request->validate([
            'title' => 'required',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'date' => 'required|date',
            'severity' => 'required',
            'status' => 'required',
            'type_id' => 'required|exists:types,id'
        ]);
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


    public function delete($catastropheId)
    {
        $catastrophe = Catastrophe::find($catastropheId);
        $catastrophe->delete();
        return response()->json(['message' => 'deleted']);
    }
    

   public function update(Request $request, $id)
   {
        $catastrophe = Catastrophe::find($id);

        if (!$catastrophe) {
            return response()->json(['message' => 'Not found'], 404);
        }



          $request->validate([
            'title' => 'sometimes',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'date' => 'sometimes|date',
            'type_id' => 'sometimes|exists:types,id'
        ]);

        $catastrophe->update([
            'title' => $request->title ?? $catastrophe->title,
            'description' => $request->description ?? $catastrophe->description,
            'latitude' => $request->latitude ?? $catastrophe->latitude,
            'longitude' => $request->longitude ?? $catastrophe->longitude,
            'date' => $request->date ?? $catastrophe->date,
            'severity' => $request->severity ?? $catastrophe->severity,
            'status' => $request->status ?? $catastrophe->status,
            'type_id' => $request->type_id ?? $catastrophe->type_id,
    ]);

        return response()->json($catastrophe);
    }
}
