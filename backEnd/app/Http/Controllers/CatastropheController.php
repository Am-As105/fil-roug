<?php

namespace App\Http\Controllers;

use App\Models\Catastrophe;
use Illuminate\Http\Request;
use App\Services\SmsService;
use Illuminate\Support\Facades\Log;

class CatastropheController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => Catastrophe::with('type')->latest()->get()
        ]);
    }

    public function show($id)
    {
        $catastrophe = Catastrophe::with('type')->find($id);

        if (!$catastrophe) {
            return response()->json([
                'success' => false,
                'message' => 'Not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $catastrophe
        ]);
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
    $sms = new SmsService();
$   $sms->send();

    try {
        $this->sendSmsNotification($catastrophe, $request->user());
    } catch (\Throwable $e) {
        \Log::error($e->getMessage());
    }

    return response()->json([
        'message' => 'Catastrophe created successfully',
        'catastrophe' => $catastrophe->load('type'),
    ], 201);
}


    public function update(Request $request, $id)
    {
        try {
            $catastrophe = Catastrophe::find($id);

            if (!$catastrophe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not found'
                ], 404);
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
                'success' => true,
                'message' => 'Updated successfully',
                'data' => $catastrophe->fresh('type')
            ]);

        } catch (\Throwable $e) {
            Log::error('Update error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur'
            ], 500);
        }
    }

    public function delete(Request $request, $id)
    {
        try {
            $catastrophe = Catastrophe::find($id);

            if (!$catastrophe) {
                return response()->json([
                    'success' => false,
                    'message' => 'Not found'
                ], 404);
            }

            $catastrophe->delete();

            return response()->json([
                'success' => true,
                'message' => 'Deleted successfully'
            ]);

        } catch (\Throwable $e) {
            Log::error('Delete error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Erreur serveur'
            ], 500);
        }
    }
}