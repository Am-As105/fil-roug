<?php

namespace App\Http\Controllers;

use App\Models\Catastrophe;
use Illuminate\Http\Request;
use App\Services\SmsService;

class CatastropheController extends Controller
{
    public function index()
    {
        return response()->json(
            Catastrophe::with('type')->latest()->get()
        );
    }

    public function show($id)
    {
        $catastrophe = Catastrophe::with('type')->find($id);

        if (!$catastrophe) {
            return response()->json(['message' => 'Not found'], 404);
        }

        return response()->json($catastrophe);
    }

    public function store(Request $request, SmsService $sms)
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

        $sms->send(null, sprintf(
            'Nouvelle catastrophe: %s. Zone: %s. Date: %s. Statut: %s. Severite: %s.',
            $catastrophe->title,
            $catastrophe->description ?? 'Non precisee',
            $catastrophe->date,
            $catastrophe->status,
            $catastrophe->severity
        ));

        return response()->json([
            'message' => 'Catastrophe created successfully',
            'catastrophe' => $catastrophe->load('type'),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $catastrophe = Catastrophe::find($id);

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

    public function delete($id)
    {
        $catastrophe = Catastrophe::find($id);

        if (!$catastrophe) {
            return response()->json(['message' => 'Not found'], 404);
        }

        $catastrophe->delete();

        return response()->json(['message' => 'deleted']);
    }
}