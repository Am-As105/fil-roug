<?php

namespace App\Http\Controllers;

use App\Models\Catastrophe;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;
use Twilio\Rest\Client;

class CatastropheController extends Controller
{
    public function index()
    {
        $catastrophes = Catastrophe::with('type')->latest()->get();
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

        try {
            $this->sendSmsNotification($catastrophe, $request->user());
        } catch (\Throwable $e) {
            Log::error($e->getMessage());
        }

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

    private function sendSmsNotification(Catastrophe $catastrophe, ?User $user = null): void
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $from = $this->normalizePhoneNumber(config('services.twilio.from'));
        $recipient = $this->normalizePhoneNumber($user?->phone ?: config('services.twilio.to'));

        if (!$sid || !$token || !$from || !$recipient) {
            return;
        }

        try {
            $client = new Client($sid, $token);

            $message = sprintf(
                'Nouvelle catastrophe: %s. Zone: %s. Date: %s. Statut: %s. Severite: %s.',
                $catastrophe->title,
                $catastrophe->description ?? 'Non precisee',
                $catastrophe->date,
                $catastrophe->status,
                $catastrophe->severity
            );

            $client->messages->create($recipient, [
                'from' => $from,
                'body' => $message,
            ]);
        } catch (Throwable $e) {
            Log::warning($e->getMessage());
        }
    }

    private function normalizePhoneNumber(?string $phone)
    {
        $phone = trim((string) $phone);

        if ($phone === '') {
            return null;
        }

        $phone = preg_replace('/[\s\-\.\(\)]/', '', $phone);

        if (str_starts_with($phone, '+')) {
            return $phone;
        }

        if (str_starts_with($phone, '00')) {
            return '+' . substr($phone, 2);
        }

        if (preg_match('/^0[5-7]\d{8}$/', $phone)) {
            return '+212' . substr($phone, 1);
        }

        if (preg_match('/^212[5-7]\d{8}$/', $phone)) {
            return '+' . $phone;
        }

        return $phone;
    }
}