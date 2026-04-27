<?php

namespace App\Http\Controllers;

use App\Models\Catastrophe;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class CatastropheController extends Controller
{
    public function index()
    {
        $catastrophes = Catastrophe::with('type')
            ->latest()
            ->get();

        return response()->json($catastrophes);
    }

    public function show($catastropheId)
    {
        $catastrophe = Catastrophe::with('type')->find($catastropheId);

        if (!$catastrophe) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($catastrophe);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'date' => 'required|date',
            'severity' => 'required|string|max:255',
            'status' => 'required|string|max:255',
            'type_id' => 'required|exists:types,id',
            'victims' => 'nullable|integer',
            'injured' => 'nullable|integer',
            'damage' => 'nullable|numeric',
        ]);

        $catastrophe = Catastrophe::create($validated);

        return response()->json([
            'message' => 'Catastrophe created successfully',
            'catastrophe' => $catastrophe->load('type'),
        ], 201);
    }

    public function update(Request $request, $catastropheId)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $catastrophe = Catastrophe::find($catastropheId);

        if (!$catastrophe) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'sometimes|nullable|string',
            'latitude' => 'sometimes|numeric',
            'longitude' => 'sometimes|numeric',
            'date' => 'sometimes|date',
            'severity' => 'sometimes|string|max:255',
            'status' => 'sometimes|string|max:255',
            'type_id' => 'sometimes|exists:types,id',
            'victims' => 'sometimes|nullable|integer',
            'injured' => 'sometimes|nullable|integer',
            'damage' => 'sometimes|nullable|numeric',
        ]);

        $catastrophe->update($validated);

        return response()->json([
            'message' => 'Catastrophe updated successfully',
            'catastrophe' => $catastrophe->fresh('type'),
        ]);
    }

    public function delete(Request $request, $catastropheId)
    {
        if ($response = $this->ensureAdmin($request)) {
            return $response;
        }

        $catastrophe = Catastrophe::find($catastropheId);

        if (!$catastrophe) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $catastrophe->delete();

        return response()->json(['message' => 'deleted']);
    }

    private function ensureAdmin(Request $request)
    {
        $user = $request->user();

        if (!$user || !$user->isAdmin()) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        return null;
    }
}
